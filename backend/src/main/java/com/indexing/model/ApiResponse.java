package com.indexing.model;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.Instant;

/**
 * Generic API response wrapper: { success, message, data, trace, timestamp }.
 * @param <T> the type of the data payload
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private boolean success;
    private String message;
    private T data;
    private OperationTrace trace;
    private String timestamp;

    public ApiResponse() {
        this.timestamp = Instant.now().toString();
    }

    public ApiResponse(boolean success, String message, T data) {
        this.success = success;
        this.message = message;
        this.data = data;
        this.timestamp = Instant.now().toString();
    }

    public ApiResponse(boolean success, String message, T data, OperationTrace trace) {
        this.success = success;
        this.message = message;
        this.data = data;
        this.trace = trace;
        this.timestamp = Instant.now().toString();
    }

    /** Convenience factory for success responses. */
    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(true, message, data);
    }

    /** Convenience factory for success responses with trace. */
    public static <T> ApiResponse<T> success(String message, T data, OperationTrace trace) {
        return new ApiResponse<>(true, message, data, trace);
    }

    /** Convenience factory for error responses. */
    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(false, message, null);
    }

    /** Convenience factory for error responses with data. */
    public static <T> ApiResponse<T> error(String message, T data) {
        return new ApiResponse<>(false, message, data);
    }

    // ========== Getters ==========

    public boolean isSuccess() {
        return success;
    }

    public String getMessage() {
        return message;
    }

    public T getData() {
        return data;
    }

    public OperationTrace getTrace() {
        return trace;
    }

    public String getTimestamp() {
        return timestamp;
    }

    // ========== Setters ==========

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public void setData(T data) {
        this.data = data;
    }

    public void setTrace(OperationTrace trace) {
        this.trace = trace;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }
}
