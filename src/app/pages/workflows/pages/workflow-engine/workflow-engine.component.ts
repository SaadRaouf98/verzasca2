import { Component, ElementRef, ViewChild } from '@angular/core';
import * as shape from 'd3-shape';
import { ClusterNode, Layout, NgxGraphZoomOptions } from '@swimlane/ngx-graph';
import { Observable, Subject, of } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { compareFn, isSmallDeviceWidthForPopup, isTouched } from '@shared/helpers/helpers';
import {
  AddNodeCommand,
  UpdateNodeCommand,
  WorkflowNodeForm,
} from '@core/models/workflow/workflow-model';
import { TranslateService } from '@ngx-translate/core';
import { CustomToastrService } from '@core/services/custom-toastr.service';

import { ActivatedRoute } from '@angular/router';
import { AllSteps } from '@core/models/step.model';
import { LanguageService } from '@core/services/language.service';
import { ManageWorkflowsService } from '@pages/workflows/services/manage-workflows.service';
import { AllActors } from '@core/models/actor.model';
import { AllEntities } from '@core/models/entity.model';
import { Node, NodeAction } from '../../../../core/models/workflow/node.model';
import { arabicRegex, englishRegex } from '@core/utils/regex';
import { Link, LinkAction } from '@core/models/workflow/link.model';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SelectActionsModalComponent } from '@pages/workflows/components/select-actions-modal/select-actions-modal.component';
import { ModalStatusCode } from '@shared/enums/modal-status-code.enum';
import { NodeType } from '@core/enums/node-type.enum';
import { EditDeleteLinkModalComponent } from '@pages/workflows/components/edit-delete-link-modal/edit-delete-link-modal.component';
import { WorkflowLinkUserAction } from '@core/enums/workflow-link-user-action.enum';
import { ActionType } from '@core/enums/action-type.enum';
import { environment } from '@env/environment';
import { OrganizationUnit } from '@core/models/organization-unit.model';
import { OrganizationUnitType } from '@core/enums/organization-unit-type.enum';
@Component({
  selector: 'app-workflow-engine',
  templateUrl: './workflow-engine.component.html',
  styleUrls: ['./workflow-engine.component.scss'],
})
export class WorkflowEngineComponent {
  form!: FormGroup;
  disableSubmitBtn: boolean = false;
  elementId: string = '';
  pageTitle: string = '';

  lang: string = 'ar';

  stepsList$: Observable<AllSteps> = new Observable();
  actorsList$: Observable<AllActors> = new Observable();
  actionsList$: Observable<AllEntities> = new Observable();

  nodes: Node[] = [];
  clusters: ClusterNode[] = [];
  links: Link[] = [];
  selectedNode: Node | null = null;
  bridgeTwoNodesCtrl: FormControl = new FormControl();
  bridgeTwoNodes: {
    start: Node | null;
    end: Node | null;
  } = {
    start: null,
    end: null,
  };
  readonly NodeColor = '#a8385d';
  readonly nodeIdPrefix = 'a_';

  layout: string | Layout = 'dagreCluster';
  layouts: any[] = [
    {
      label: 'Dagre',
      value: 'dagre',
    },
    {
      label: 'Dagre Cluster',
      value: 'dagreCluster',
      isClustered: true,
    },
    {
      label: 'D3 Force Directed',
      value: 'd3ForceDirected',
    },
  ];

  // line interpolation
  curveType: string = 'Bundle';
  curve: any = shape.curveLinear;
  interpolationTypes = [
    'Bundle',
    'Cardinal',
    'Catmull Rom',
    'Linear',
    'Monotone X',
    'Monotone Y',
    'Natural',
    'Step',
    'Step After',
    'Step Before',
  ];

  draggingEnabled: boolean = true;
  panningEnabled: boolean = true;
  zoomEnabled: boolean = true;

  zoomSpeed: number = 0.1;
  minZoomLevel: number = 0.1;
  maxZoomLevel: number = 4.0;
  panOnZoom: boolean = true;

  autoZoom: boolean = false;
  autoCenter: boolean = false;

  update$: Subject<boolean> = new Subject();
  center$: Subject<boolean> = new Subject();
  zoomToFit$: Subject<NgxGraphZoomOptions> = new Subject();

  compareFn = compareFn;
  environment = environment;
  organizationUnitsList: OrganizationUnit[] = [];

  @ViewChild('title') titleInputElement!: ElementRef;

  constructor(
    private toastr: CustomToastrService,
    private translateService: TranslateService,
    private activatedRoute: ActivatedRoute,
    private languageService: LanguageService,
    private manageWorkflowsService: ManageWorkflowsService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.initializeGraph();
    this.intializeDropDownLists();
    this.initializeForm();
    this.setInterpolationType(this.curveType);
    this.lang = this.languageService.language;
    this.bridgeTwoNodesCtrl.valueChanges.subscribe((val: boolean) => {
      if (!val) {
        this.bridgeTwoNodes = {
          start: null,
          end: null,
        };
      }
    });
  }

  initializeForm(): void {
    this.form = new FormGroup({
      id: new FormControl('', []),
      title: new FormControl('', [Validators.required, Validators.pattern(arabicRegex)]),
      titleEn: new FormControl('', [
        //Validators.required,
        Validators.pattern(englishRegex),
      ]),
      description: new FormControl('', [Validators.pattern(arabicRegex)]),
      descriptionEn: new FormControl('', [Validators.pattern(englishRegex)]),
      step: new FormControl('', [Validators.required]),
      committee: new FormControl('', []),
      actor: new FormControl('', [Validators.required]),
      actions: new FormControl('', [Validators.required]),
    });
  }

  prefixNodesIds(nodes: Node[], links: Link[]): void {
    nodes.forEach((ele) => {
      const id = ele.id;
      ele.id = `${this.nodeIdPrefix}${id}`;
    });
    links.forEach((ele) => {
      const id = ele.id;
      const source = ele.source;
      const target = ele.target;

      ele.id = `${this.nodeIdPrefix}${id}`;
      ele.source = `${this.nodeIdPrefix}${source}`;
      ele.target = `${this.nodeIdPrefix}${target}`;
    });
  }

  prefixNodeId(node: Node): void {
    const id = node.id.toUpperCase();
    node.id = `${this.nodeIdPrefix}${id}`;
  }

  unprefixNodeId(node: Node): void {
    const id = node.id;
    node.id = id.replace(this.nodeIdPrefix, '');
  }

  prefixString(id: string): string {
    return `${this.nodeIdPrefix}${id}`;
  }

  unPrefixString(id: string): string {
    return id.replace(this.nodeIdPrefix, '');
  }

  prefixLinkNodeDataIds(link: Link): void {
    const source = link.source;
    const target = link.target;

    link.source = `${this.nodeIdPrefix}${source}`;
    link.target = `${this.nodeIdPrefix}${target}`;
  }

  UnprefixNodesIds(nodes: Node[], links: Link[]): void {
    nodes.forEach((ele) => {
      const id = ele.id;
      ele.id = `${id.replace(this.nodeIdPrefix, '')}`;
    });
    links.forEach((ele) => {
      const source = ele.source;
      const target = ele.target;

      ele.source = source.replace(this.nodeIdPrefix, '');
      ele.target = target.replace(this.nodeIdPrefix, '');
    });
  }

  initializeGraph(): void {
    this.elementId = this.activatedRoute.snapshot.params['id'];
    if (this.elementId) {
      this.manageWorkflowsService.workflowsService.getWorkflowById(this.elementId).subscribe({
        next: (res) => {
          this.prefixNodesIds(res.nodes, res.links);
          this.nodes = res.nodes;
          this.links = res.links;
          this.pageTitle = this.lang === 'ar' ? res.title : res.titleEn;
        },
      });
    }
  }

  intializeDropDownLists(): void {
    this.stepsList$ = this.manageWorkflowsService.stepsService.getStepsList(
      {
        pageSize: 100,
        pageIndex: 0,
      },
      undefined,
      ['id', 'title', 'titleEn']
    );

    this.actorsList$ = this.manageWorkflowsService.actorsService.getActorsList(
      {
        pageSize: 100,
        pageIndex: 0,
      },
      undefined,
      undefined,

      ['id', 'title', 'titleEn']
    );

    this.actionsList$ = this.manageWorkflowsService.actionsService.getActionsList(
      {
        pageSize: 100,
        pageIndex: 0,
      },
      undefined,
      undefined,
      ['id', 'title', 'titleEn', 'actionType']
    );

    this.manageWorkflowsService.organizationUnitsService
      .getOrganizationUnitsList(
        {
          pageSize: 100,
          pageIndex: 0,
        },
        {
          type: OrganizationUnitType.Committee,
        }
      )
      .subscribe((res) => {
        this.organizationUnitsList = res.data;
      });
  }

  setInterpolationType(curveType: string): void {
    this.curveType = curveType;
    if (curveType === 'Bundle') {
      this.curve = shape.curveBundle.beta(1);
    }
    if (curveType === 'Cardinal') {
      this.curve = shape.curveCardinal;
    }
    if (curveType === 'Catmull Rom') {
      this.curve = shape.curveCatmullRom;
    }
    if (curveType === 'Linear') {
      this.curve = shape.curveLinear;
    }
    if (curveType === 'Monotone X') {
      this.curve = shape.curveMonotoneX;
    }
    if (curveType === 'Monotone Y') {
      this.curve = shape.curveMonotoneY;
    }
    if (curveType === 'Natural') {
      this.curve = shape.curveNatural;
    }
    if (curveType === 'Step') {
      this.curve = shape.curveStep;
    }
    if (curveType === 'Step After') {
      this.curve = shape.curveStepAfter;
    }
    if (curveType === 'Step Before') {
      this.curve = shape.curveStepBefore;
    }
  }

  setLayout(layoutName: string): void {
    const layout = this.layouts.find((l) => l.value === layoutName);
    this.layout = layoutName;
    if (!layout.isClustered) {
      //@ts-ignore
      this.clusters = undefined;
    } else {
      this.clusters = [];
    }
  }

  onSelect(node: Node): void {
    this.titleInputElement.nativeElement.focus();

    if (this.selectedNode && this.selectedNode.id !== node.id) {
      //mark form untouched
      this.form.markAsUntouched();
    }

    this.selectedNode = node;
    this.patchForm({
      id: node.id || '',
      title: node.data.title!,
      titleEn: node.data.titleEn!,
      description: node.data.description!,
      descriptionEn: node.data.descriptionEn!,
      step: node.data.step!,
      committee: node.data.committee!,
      actor: node.data.actor!,
      actions: node.data.actions!,
    });

    //logic if bridge 2 nodes is enabled
    if (this.bridgeTwoNodesCtrl.value) {
      if (this.bridgeTwoNodes.start === null) {
        this.bridgeTwoNodes.start = node;
      } else if (this.bridgeTwoNodes.start && !this.bridgeTwoNodes.end) {
        this.bridgeTwoNodes.end = node;
        this.handleAddingBridgeLink(
          this.bridgeTwoNodes.start,
          this.bridgeTwoNodes.end,
          this.bridgeTwoNodes.start.data.color
        );
      }
    }
  }

  onAddNode(): void {
    if (this.nodes.length === 0) {
      this.selectedNode = null;
    }

    if (this.selectedNode && this.selectedNode.data.category === NodeType.Secondary) {
      this.toastr.error(
        this.translateService.instant(
          'WorkflowsModule.WorkflowEngineComponent.canotAddMainNodeFromSecondary'
        )
      );
      return;
    }

    if (this.nodes.length > 0 && !this.selectedNode) {
      this.toastr.error(
        this.translateService.instant(
          'WorkflowsModule.WorkflowEngineComponent.selectParentNodeFirst'
        )
      );
      return;
    }

    if (this.selectedNode && !this.selectedNode.data.actions) {
      this.toastr.error(
        this.translateService.instant('WorkflowsModule.WorkflowEngineComponent.enterNodeDataFirst')
      );
      return;
    }

    const newNode: Node = this.getNewNodeBasicData(
      'New Main Node',
      NodeType.Main,
      this.NodeColor,
      this.selectedNode ? this.selectedNode.id || '' : ''
    );

    if (this.selectedNode) {
      //we are NOT adding the root node
      this.handleAddNewNodeAndLink(this.selectedNode, newNode, this.NodeColor);
    } else {
      //we are adding the root node
      this.nodes.push(newNode);
      this.update$.next(true);
      this.onSelect(newNode);
      this.markLeavesAndUnLeaves();
    }
  }

  private markLeavesAndUnLeaves(): void {
    if (this.nodes.length === 1) {
      this.nodes[0].isLeaf = true;
      return;
    }

    if (this.nodes.length > 1) {
      this.nodes.forEach((node) => {
        let nodeIsLeaf = true;

        this.links.forEach((link) => {
          if (link.source === node.id) {
            node.isLeaf = false;
            nodeIsLeaf = false;
          }
        });

        if (nodeIsLeaf) {
          node.isLeaf = true;
        }
      });
    }
  }

  private resetBridgeTwoNodesCtrl(): void {
    this.bridgeTwoNodesCtrl.setValue(false);
    this.bridgeTwoNodes.start = null;
    this.bridgeTwoNodes.end = null;
  }

  private handleAddingBridgeLink(startNode: Node, endNode: Node, nodeColor: string): void {
    const modalActionsList: LinkAction[] = startNode.data.actions
      ?.filter((ele) => !ele.isSelected)
      .map((ele) => {
        return {
          id: ele.id,
          title: ele.title,
          titleEn: ele.titleEn,
          actionType: ele.actionType,
        };
      }) as LinkAction[];

    if (modalActionsList.length === 0) {
      this.toastr.error(
        this.translateService.instant(
          'WorkflowsModule.WorkflowEngineComponent.allNodesActionsHaveTaken'
        )
      );
      this.resetBridgeTwoNodesCtrl();
      return;
    }

    const dialogRef = this.openLinkActionsModal(modalActionsList);
    dialogRef.afterClosed().subscribe(
      (dialogResult: {
        statusCode: ModalStatusCode;
        status: string;
        data: {
          selectedActions: LinkAction[];
          selectedActionsIds: string[];
        };
      }) => {
        if (dialogResult && dialogResult.statusCode === ModalStatusCode.Success) {
          const { selectedActions, selectedActionsIds } = dialogResult.data;
          this.unprefixNodeId(startNode);
          this.unprefixNodeId(endNode);

          //Call backend service
          this.manageWorkflowsService.workflowsService
            .bridgeTwoNodes(this.elementId, {
              sourceId: startNode.id,
              destinationId: endNode.id,
              actionsIds: selectedActionsIds,
            })
            .subscribe({
              next: (res) => {
                this.resetBridgeTwoNodesCtrl();
                if (startNode.id === endNode.id) {
                  this.prefixNodeId(startNode);
                } else {
                  this.prefixNodeId(startNode);
                  this.prefixNodeId(endNode);
                }

                this.toastr.success(
                  this.translateService.instant(
                    'WorkflowsModule.WorkflowEngineComponent.bridgedSuccessfully'
                  )
                );
                //Mark the node's actions that is selected by the user in the modal
                startNode.data.actions?.forEach((ele) => {
                  if (selectedActionsIds.includes(ele.id)) {
                    ele.isSelected = true;
                  }
                });

                this.addLink(startNode, endNode, nodeColor, selectedActions);
                this.markLeavesAndUnLeaves();
              },
              error: (err) => {
                this.resetBridgeTwoNodesCtrl();
                this.toastr.error(
                  this.translateService.instant(
                    'WorkflowsModule.WorkflowEngineComponent.bridgedFailed'
                  )
                );
              },
            });
        } else if (dialogResult && dialogResult.statusCode === ModalStatusCode.Cancel) {
          this.resetBridgeTwoNodesCtrl();
        }
      }
    );
  }

  private handleAddNewNodeAndLink(sourceNode: Node, newNode: Node, nodeColor: string): void {
    const modalActionsList: LinkAction[] = sourceNode!.data.actions
      ?.filter((ele) => !ele.isSelected)
      .map((ele) => {
        return {
          id: ele.id,
          title: ele.title,
          titleEn: ele.titleEn,
          schemaStepActionId: ele.schemaStepActionId,
          actionType: ele.actionType,
        };
      }) as LinkAction[];

    if (modalActionsList.length === 0) {
      this.toastr.error(
        this.translateService.instant(
          'WorkflowsModule.WorkflowEngineComponent.allNodesActionsHaveTaken'
        )
      );
      return;
    }

    const dialogRef = this.openLinkActionsModal(modalActionsList);
    dialogRef.afterClosed().subscribe(
      (dialogResult: {
        statusCode: ModalStatusCode;
        status: string;
        data: {
          selectedActions: LinkAction[];
          selectedActionsIds: string[];
        };
      }) => {
        if (dialogResult && dialogResult.statusCode === ModalStatusCode.Success) {
          const { selectedActions, selectedActionsIds } = dialogResult.data;

          //Mark the node's actions that is selected by the user in the modal
          sourceNode.data.actions?.forEach((ele) => {
            if (selectedActionsIds.includes(ele.id)) {
              ele.isSelected = true;
            }
          });

          this.nodes.push(newNode);
          this.update$.next(true);
          this.addLink(sourceNode, newNode, nodeColor, selectedActions);
          this.onSelect(newNode);
          this.markLeavesAndUnLeaves();
        }
      }
    );
  }

  private openLinkActionsModal(
    allActions: LinkAction[],
    selectedActions?: LinkAction[]
  ): MatDialogRef<SelectActionsModalComponent, any> {
    return this.dialog.open(SelectActionsModalComponent, {
      minWidth: isSmallDeviceWidthForPopup() ? '95vw' : '600px',
      autoFocus: false,
      disableClose: false,
      data: {
        allActions: allActions,
        selectedActions,
      },
    });
  }

  private addLink(parentNode: Node, childNode: Node, linkColor: string, linkActions: LinkAction[]) {
    this.links.push({
      id: this.getUniqueId(),
      source: parentNode.id || '',
      target: childNode.id,
      label: linkActions
        .map((ele: LinkAction) => (this.lang === 'ar' ? ele.title : ele.titleEn))
        .join(' , '), //'is parent of'
      color: linkColor,
      actions: linkActions,
    });

    this.update$.next(true);
  }

  private getNewNodeBasicData(
    label: string,
    category: NodeType,
    color: string,
    parentId: string
  ): Node {
    const newNode: Node = {
      id: this.getUniqueId(),
      isLeaf: true,
      label,
      data: {
        id: null, //Based on Adawy, we first send this field null
        category,
        color,
      },
    };

    if (parentId) {
      newNode.parentId = `["${parentId}"]`;
    }
    return newNode;
  }

  onLinkClicked(link: Link): void {
    const dialogRef = this.dialog.open(EditDeleteLinkModalComponent, {
      minWidth: isSmallDeviceWidthForPopup() ? '95vw' : '600px',
      autoFocus: false,
      disableClose: false,
    });

    dialogRef.afterClosed().subscribe(
      (dialogResult: {
        statusCode: ModalStatusCode;
        status: string;
        data: {
          userAction: WorkflowLinkUserAction;
        };
      }) => {
        if (dialogResult && dialogResult.statusCode === ModalStatusCode.Success) {
          if (dialogResult.data.userAction === WorkflowLinkUserAction.Delete) {
            //1)-Check if target node has more than one link targeting it
            //if so, yes you can delete the link,otherwise you can't

            const linksTargettingTheNode = this.links.filter((ele) => ele.target === link.target);

            if (linksTargettingTheNode.length === 1) {
              this.toastr.error(
                this.translateService.instant(
                  'WorkflowsModule.WorkflowEngineComponent.cannotDeleteLink'
                )
              );
              return;
            }

            //2)- Delete the link

            this.manageWorkflowsService.workflowsService
              .deleteLink(
                this.elementId,
                link.actions.map((ele) => ele.schemaStepActionId!)
              )
              .subscribe({
                next: (res) => {
                  this.removeOnlyLink(link);
                  this.toastr.success(
                    this.translateService.instant(
                      'WorkflowsModule.WorkflowEngineComponent.linkDeletedSuccessfully'
                    )
                  );
                  this.initializeGraph();
                },
                error: (err) => {
                  this.toastr.error(this.translateService.instant('shared.SomethingWentWrong'));
                },
              });
          } else if (dialogResult.data.userAction === WorkflowLinkUserAction.Edit) {
            const linkActions: LinkAction[] = JSON.parse(JSON.stringify(link.actions));
            const sourceNode = this.nodes.find((ele) => ele.id === link.source);
            const unselectedSourceNodeActions = sourceNode?.data.actions?.filter(
              (ele) => ele.isSelected === false || !ele.isSelected
            );

            const allActionsPassedToModal: LinkAction[] = [
              ...(unselectedSourceNodeActions as LinkAction[]),
            ];

            link.actions.forEach((linkAction) => {
              const action: {
                id: string;
                schemaStepActionId: string;
                title: string;
                titleEn: string;
                isSelected: boolean;
                actionType: ActionType;
              } = {
                id: linkAction.id,
                schemaStepActionId: linkAction.schemaStepActionId || '',
                title: linkAction.title,
                titleEn: linkAction.titleEn,
                isSelected: true,
                actionType: linkAction.actionType,
              };
              allActionsPassedToModal.push(action);
            });

            /*  unselectedSourceNodeActions?.forEach((ele) => {
              actionsToChosenFrom.push(ele);
            }); */
            const dialogRef = this.openLinkActionsModal(allActionsPassedToModal, linkActions);
            dialogRef.afterClosed().subscribe(
              (dialogResult: {
                statusCode: ModalStatusCode;
                status: string;
                data: {
                  selectedActions: LinkAction[];
                  selectedActionsIds: string[];
                };
              }) => {
                if (dialogResult && dialogResult.statusCode === ModalStatusCode.Success) {
                  //Call backend service
                  this.manageWorkflowsService.workflowsService
                    .bridgeTwoNodes(this.elementId, {
                      sourceId: this.unPrefixString(link.source),
                      destinationId: this.unPrefixString(link.target),
                      actionsIds: dialogResult.data.selectedActionsIds,
                    })
                    .subscribe({
                      next: (res) => {
                        this.toastr.success(
                          this.translateService.instant(
                            'WorkflowsModule.WorkflowEngineComponent.linkUpdateSuccess'
                          )
                        );

                        /*              //1)- Update link's label
                        link.label = dialogResult.data.selectedActions
                          .map((ele: LinkAction) =>
                            this.lang === 'ar' ? ele.title : ele.titleEn
                          )
                          .join(' , ');
                        //2)- Update link's actions
                        link.actions = dialogResult.data.selectedActions; */

                        //Update the link
                        const linkElement = this.links.find((ele) => ele.id === link.id);
                        if (linkElement) {
                          linkElement.id = this.prefixString(res.id);
                          linkElement.source = this.prefixString(res.source);
                          linkElement.target = this.prefixString(res.target);
                          linkElement.label = res.label;
                          linkElement.color = res.color;
                          linkElement.actions = [];
                          res.actions.forEach((action) => {
                            action.isSelected = true;
                            linkElement.actions.push(action);
                          });
                        }

                        //3)- Update source node actions (mark which is selected and which is unselected)'
                        allActionsPassedToModal?.forEach((linkAction) => {
                          const nodeAction = sourceNode!.data.actions?.find(
                            (x) => x.id === linkAction.id
                          );

                          if (dialogResult.data.selectedActionsIds.includes(linkAction.id)) {
                            nodeAction!.isSelected = true;
                          } else {
                            nodeAction!.isSelected = false;
                          }
                        });
                        this.update$.next(true);
                      },
                      error: (err) => {
                        this.toastr.error(
                          this.translateService.instant(
                            'WorkflowsModule.WorkflowEngineComponent.linkUpdateFailed'
                          )
                        );
                      },
                    });
                }
              }
            );
          }
        }
      }
    );
  }

  onDeleteNode(node: Node): void {
    if (!node.isLeaf) {
      return;
    }

    if (!node.data?.id) {
      //Node is not yet persisted in database, so we can delete it only from client side
      //We don't call backend service

      //1)Delete the node
      //a) If it is the root
      if (!node.parentId) {
        this.nodes = [];
        this.links = [];
        this.update$.next(true);
        return;
      }

      //b)- Remove the node itself
      this.removeOnlyNode(node);

      //2)Delete links pointing to the node and restore the actions on the links
      const linksIdsToBeRemoved: string[] = [];
      const restoredParentsActions: {
        parentId: string;
        restoredActions: LinkAction[];
      }[] = [];

      for (const link of this.links) {
        if (link.target === node.id) {
          linksIdsToBeRemoved.push(link.id);
          restoredParentsActions.push({
            parentId: link.source,
            restoredActions: link.actions,
          });
        }
      }

      this.links = this.links.filter((ele) => !linksIdsToBeRemoved.includes(ele.id));

      const NodesIdsOfActionsToBeUpdated = restoredParentsActions.map((ele) => ele.parentId);
      const restoredNodes = this.nodes.filter((ele) =>
        NodesIdsOfActionsToBeUpdated.includes(ele.id || '')
      );

      restoredNodes.forEach((node) => {
        const restoredActionsIds = restoredParentsActions
          .find((ele) => ele.parentId === node.id)
          ?.restoredActions.map((ele) => ele.id);
        node.data.actions?.forEach((action) => {
          if (restoredActionsIds?.includes(action.id)) {
            action.isSelected = false;
          }
        });
      });

      //3)mark unleaves

      this.markLeavesAndUnLeaves();

      return;
    }

    //Node is persisted in DB, so we need to call backend service

    this.unprefixNodeId(node);
    this.manageWorkflowsService.workflowsService.deleteNode(this.elementId, node.id).subscribe({
      next: (res) => {
        this.toastr.success(
          this.translateService.instant(
            'WorkflowsModule.WorkflowEngineComponent.nodeDeletedSuccessfully'
          )
        );

        this.initializeGraph();
      },
    });
  }

  onClearAction(event: { id: string; title: string; titleEn: string; actionType: ActionType }) {
    //If user clears action and there is no nodes created or user hasn't selected a node
    if (this.nodes.length === 0 || !this.selectedNode) {
      return;
    }

    //
    //   'this.selectedNode.data.actions',
    //   this.selectedNode.data.actions
    // );
    //

    let canProceed = true;
    for (const action of this.selectedNode.data?.actions!) {
      if (action.id === event.id && action.isSelected) {
        canProceed = false;
        this.toastr.error(
          this.translateService.instant(
            'WorkflowsModule.WorkflowEngineComponent.cannotDeleteAction'
          )
        );
        break;
      }
    }

    if (!canProceed) {
      //Undo the deleted action
      this.form.patchValue({
        actions: this.selectedNode.data.actions,
      });
      console.warn('this.form.value', this.form.value);
      return;
    }
  }

  private removeOnlyNode(node: Node) {
    const index = this.nodes.findIndex((ele) => ele.id === node.id);
    this.nodes.splice(index, 1);
  }

  private removeOnlyLink(link: Link) {
    const index = this.links.findIndex((ele) => ele.id === link.id);
    this.links.splice(index, 1);
  }

  private getUniqueId(): string {
    return `a${Date.now().toString()}`;
  }

  patchForm(data: WorkflowNodeForm): void {
    const { id, title, titleEn, description, descriptionEn, step, actor, committee, actions } =
      data;

    this.form.patchValue({
      id,
      title,
      titleEn,
      description,
      descriptionEn,
      step,
      committee,
      actor,
      actions,
    });
  }

  onSubmit(): void {
    if (!this.form.valid) {
      return;
    }

    if (!this.selectedNode || this.nodes.length === 0) {
      this.toastr.error(
        this.translateService.instant('WorkflowsModule.WorkflowEngineComponent.selectNodeFirst')
      );
      return;
    }
    this.disableSubmitBtn = true;
    const {
      title,
      titleEn,
      description,
      descriptionEn,
      step,
      committee,
      actor,
      actions: selectedFormActions,
    } = JSON.parse(JSON.stringify(this.form.value));

    this.selectedNode.data.title = title;
    this.selectedNode.data.titleEn = titleEn;
    this.selectedNode.data.description = description;
    this.selectedNode.data.descriptionEn = descriptionEn;
    this.selectedNode.data.step = step;
    this.selectedNode.data.committee = committee;

    this.selectedNode.data.actor = actor;

    if (!this.selectedNode.data?.actions) {
      //User is ceating node for first time
      selectedFormActions.forEach(
        (ele: { id: string; title: string; titleEn: string; isSelected: boolean }) =>
          (ele.isSelected = false)
      );

      this.selectedNode.data.actions = selectedFormActions;
      console.warn('this.selectedNode', this.selectedNode);
      this.postOrUpdateNode('Add', this.selectedNode);
    } else {
      //User has selected actions for this node before(It means that user has entered node data before and then comes back and updates it this time)

      selectedFormActions.forEach(
        (outerEle: { id: string; title: string; titleEn: string; isSelected: boolean }) => {
          this.selectedNode!.data.actions!.forEach((innerEle) => {
            if (outerEle.id === innerEle.id) {
              outerEle.isSelected = innerEle.isSelected;
            }
          });
        }
      );

      this.selectedNode.data.actions = selectedFormActions;
      this.postOrUpdateNode('Update', this.selectedNode);
    }
  }

  private postOrUpdateNode(mode: 'Add' | 'Update', node: Node) {
    if (mode === 'Add') {
      //WE ARE IN Add mode

      const isNotRootNode: boolean = node.parentId ? true : false;
      let schemaStepActionsIds: string[] = [];
      let linkPointingToNewCreatedNode: Link | null = null;

      if (isNotRootNode) {
        for (const link of this.links) {
          if (link.target === node.id) {
            schemaStepActionsIds = link.actions.map((ele) => ele.schemaStepActionId!);
            linkPointingToNewCreatedNode = link;
            break;
          }
        }
      }

      const dataToSend: AddNodeCommand = {
        schemaStepActionsIds,
        node: {
          id: node.id,
          parentId: node.parentId,
          position: node.position,
          dimension: node.dimension,
          label: node.label,
          transform: node.transform,
          meta: node.meta,
          data: {
            id: null,
            title: node.data?.title || '',
            titleEn: node.data?.titleEn || '',
            description: node.data?.description || '',
            descriptionEn: node.data?.descriptionEn || '',
            stepId: node.data?.step?.id || '',
            committeeId: node.data?.committee?.id || null,
            actorId: node.data?.actor?.id || '',
            actions: node.data?.actions || [],
            category: node.data.category,
            color: node.data.color,
          },
        },
      };

      this.manageWorkflowsService.workflowsService
        .createNode(this.elementId, dataToSend)
        .subscribe({
          next: (res) => {
            node.id = res.schemaStepId.toUpperCase();
            this.prefixNodeId(node);
            if (linkPointingToNewCreatedNode) {
              linkPointingToNewCreatedNode.target = node.id;
            }
            node.data.id = res.schemaStepId;
            node.data.actions = res.actions;
            this.toastr.success(this.translateService.instant('shared.dataUpdatedSuccessfully'));
            this.disableSubmitBtn = false;

            this.markLeavesAndUnLeaves();
            this.update$.next(true);
          },
          error: (err) => {
            this.toastr.error(this.translateService.instant('shared.SomethingWentWrong'));
            this.markLeavesAndUnLeaves();
            this.disableSubmitBtn = false;
          },
        });
    } else {
      //Update mode
      this.unprefixNodeId(node);
      const dataToSend: UpdateNodeCommand = {
        id: node.id,
        parentId: node.parentId,
        position: node.position,
        dimension: node.dimension,
        label: node.label,
        transform: node.transform,
        meta: node.meta,
        data: {
          id: node.id,
          title: node.data?.title || '',
          titleEn: node.data?.titleEn || '',
          description: node.data?.description || '',
          descriptionEn: node.data?.descriptionEn || '',
          stepId: node.data?.step?.id || '',
          committeeId: node.data?.committee?.id || null,
          actorId: node.data?.actor?.id || '',
          actions: node.data?.actions || [],
          category: node.data.category,
          color: node.data.color,
        },
      };
      this.manageWorkflowsService.workflowsService
        .updateNode(this.elementId, dataToSend)
        .subscribe({
          next: (res) => {
            node.data.actions = res;
            this.prefixNodeId(node);
            this.toastr.success(this.translateService.instant('shared.dataUpdatedSuccessfully'));
            this.disableSubmitBtn = false;
            this.markLeavesAndUnLeaves();
            this.update$.next(true);
          },
          error: (err) => {
            this.toastr.error(this.translateService.instant('shared.SomethingWentWrong'));
            this.disableSubmitBtn = false;
            this.markLeavesAndUnLeaves();
          },
        });
    }
  }

  onCancel(): void {
    this.form.reset();
  }

  getToolTipText(node: Node): string {
    if (!node.data?.step) {
      return '';
    }

    if (this.lang === 'ar') {
      return `${node.data?.step?.title}
      ${node.data?.actor?.title} 
        ${node.data?.actions
          ?.map((ele: { id: string; title: string; titleEn: string }) => ele.title)
          .toString()}`;
    }

    return `${node.data?.step?.titleEn}
    ${node.data?.actor?.titleEn}       
      ${node.data?.actions
        ?.map((ele: { id: string; title: string; titleEn: string }) => ele.titleEn)
        .toString()}`;
  }

  isTouched(controlName: string): boolean | undefined {
    return isTouched(this.form, controlName);
  }

  onSelectedStepChanged(): void {
    const { step } = this.form.value;

    if (step && step.id === environment.committeeApprovalStepId) {
      //Make committeeId is required
      this.form.get('committee')?.addValidators(Validators.required);
    } else {
      this.form.get('committee')?.removeValidators(Validators.required);
      this.form.get('committee')?.updateValueAndValidity();
    }
  }
}
