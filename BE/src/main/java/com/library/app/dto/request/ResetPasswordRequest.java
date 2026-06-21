package com.library.app.dto.request;

public class ResetPasswordRequest {
    private String email;
    private String newPassword;

    public String getEmail() { return email; }
    public String getNewPassword() { return newPassword; }
}
