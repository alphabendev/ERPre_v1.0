package com.project.erpre.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;

import javax.persistence.*;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;

@Builder
@Entity
@Table(name = "m_employee")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Employee {

    // @GeneratedValue(strategy = GenerationType.IDENTITY) Employee ID is not auto-incremented
    @Id
    @Column(name = "employee_id", length = 50, nullable = false)
    private String employeeId;

    @Column(name = "employee_pw", length = 50, nullable = false)
    private String employeePw;

    @Column(name = "employee_name", length = 50, nullable = false)
    private String employeeName;

    @Column(name = "employee_email", length = 30)
    private String employeeEmail;

    @Column(name = "employee_tel", length = 20, nullable = false)
    private String employeeTel;

    @Column(name = "employee_role", length = 20, nullable = false)
    private String employeeRole;

    @Column(name = "employee_insert_date", nullable = false, updatable = false)
    private Timestamp employeeInsertDate;

    @Column(name = "employee_update_date")
    private Timestamp employeeUpdateDate;

    @Column(name = "employee_delete_yn", length = 20, nullable = false, columnDefinition = "VARCHAR(20) DEFAULT 'N'")
    private String employeeDeleteYn; // Default value 'N' indicates deletion status

    @Column(name = "employee_delete_date")
    private Timestamp employeeDeleteDate; // Deletion timestamp

    // One employee can have multiple orders
    @ToString.Exclude
    @OneToMany(mappedBy = "employee", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Order> order;

    @PrePersist
    protected void onCreate() {
        this.employeeInsertDate = Timestamp.valueOf(LocalDateTime.now());
    }

    @PreUpdate
    protected void onUpdate() {
        this.employeeUpdateDate = Timestamp.valueOf(LocalDateTime.now());
    }

}
