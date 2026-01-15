package com.ncwd.multiplayerleetcode.dto;

public class CodeRunRequest {
    private String problemSlug;
    private String code;
    private Integer testCaseIndex; // Changed to Integer to allow null
    
    // Constructors
    public CodeRunRequest() {
    }
    
    public CodeRunRequest(String problemSlug, String code, Integer testCaseIndex) {
        this.problemSlug = problemSlug;
        this.code = code;
        this.testCaseIndex = testCaseIndex;
    }
    
    // Getters and Setters
    public String getProblemSlug() {
        return problemSlug;
    }
    
    public void setProblemSlug(String problemSlug) {
        this.problemSlug = problemSlug;
    }
    
    public String getCode() {
        return code;
    }
    
    public void setCode(String code) {
        this.code = code;
    }
    
    public Integer getTestCaseIndex() {
        return testCaseIndex;
    }
    
    public void setTestCaseIndex(Integer testCaseIndex) {
        this.testCaseIndex = testCaseIndex;
    }
}