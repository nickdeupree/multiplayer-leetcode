package com.ncwd.multiplayerleetcode.dto;

public class CodeRunResponse {
    private String status; // "success", "failed", "error", "timeout"
    private String actualOutput;
    private String expectedOutput;
    private String errorMessage;
    private String errorType;
    private String traceback;
    private long executionTimeMs;
    
    // Constructors
    public CodeRunResponse() {
    }
    
    public CodeRunResponse(String status, String actualOutput, String expectedOutput, 
                          String errorMessage, long executionTimeMs) {
        this(status, actualOutput, expectedOutput, errorMessage, null, null, executionTimeMs);
    }
    
    public CodeRunResponse(String status, String actualOutput, String expectedOutput, 
                          String errorMessage, String errorType, String traceback, long executionTimeMs) {
        this.status = status;
        this.actualOutput = actualOutput;
        this.expectedOutput = expectedOutput;
        this.errorMessage = errorMessage;
        this.errorType = errorType;
        this.traceback = traceback;
        this.executionTimeMs = executionTimeMs;
    }
    
    // Getters and Setters
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public String getActualOutput() {
        return actualOutput;
    }
    
    public void setActualOutput(String actualOutput) {
        this.actualOutput = actualOutput;
    }
    
    public String getExpectedOutput() {
        return expectedOutput;
    }
    
    public void setExpectedOutput(String expectedOutput) {
        this.expectedOutput = expectedOutput;
    }
    
    public String getErrorMessage() {
        return errorMessage;
    }
    
    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }
    
    public String getErrorType() {
        return errorType;
    }
    
    public void setErrorType(String errorType) {
        this.errorType = errorType;
    }
    
    public String getTraceback() {
        return traceback;
    }
    
    public void setTraceback(String traceback) {
        this.traceback = traceback;
    }
    
    public long getExecutionTimeMs() {
        return executionTimeMs;
    }
    
    public void setExecutionTimeMs(long executionTimeMs) {
        this.executionTimeMs = executionTimeMs;
    }
}
