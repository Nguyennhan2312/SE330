package com.library.app.dto.request;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;

public class UpdateProfileRequest {
    @NotBlank(message = "Họ tên không được để trống")
    private String fullName;
    private String phone;
    private String address;
    private LocalDate dateOfBirth;

    public String getFullName() { return fullName; }
    public String getPhone() { return phone; }
    public String getAddress() { return address; }
    public LocalDate getDateOfBirth() { return dateOfBirth; }
}
