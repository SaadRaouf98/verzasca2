export enum RequestProgressType {
  /// <summary>
  /// No specific progress started
  /// </summary>
  Workflow = 0,
  /// <summary>
  /// Export Recommendation (Record, Note, Letter, Other)
  /// </summary>
  Recommendation = 1,
  /// <summary>
  /// Request statement
  /// </summary>
  Statement = 2,
  /// <summary>
  /// Request workflow finished
  /// </summary>
  Done = 3,
}
