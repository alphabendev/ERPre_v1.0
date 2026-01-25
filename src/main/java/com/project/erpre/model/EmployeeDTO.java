package com.project.erpre.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.Column;
import java.sql.Timestamp;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class EmployeeDTO {

    private String employeeId;
    private String employeePw;
    private String employeeName;
    private String employeeEmail;
    private String employeeTel;
    private String employeeRole;
    private Timestamp employeeInsertDate;
    private Timestamp employeeUpdateDate;
    private String employeeDeleteYn; // Default value 'N' indicates deletion status
    private Timestamp employeeDeleteDate; // Deletion timestamp
}
