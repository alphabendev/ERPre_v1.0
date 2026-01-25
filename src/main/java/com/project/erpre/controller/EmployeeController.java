package com.project.erpre.controller;

import com.project.erpre.model.Employee;
import com.project.erpre.model.EmployeeDTO;
import com.project.erpre.repository.EmployeeRepository;
import com.project.erpre.service.EmployeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpSession;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class EmployeeController {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private EmployeeService employeeService;

    // Login endpoint
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest, HttpSession session) {
        String employeeId = loginRequest.get("employeeId");
        String employeePw = loginRequest.get("employeePw");

        // Receive reCAPTCHA response but do not validate it
        String recaptchaResponse = loginRequest.get("recaptchaResponse");

        // Validate ID and password
        Employee employee = employeeRepository
                .findByEmployeeIdAndEmployeePw(employeeId, employeePw)
                .orElse(null);

        if (employee != null) {
            session.setAttribute("employee", employee);

            // Respond with user information on successful login
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Login successful");
            response.put("employee", employee); // Include user information

            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "The ID or password is incorrect."));
        }
    }

    // Logout endpoint
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {
        session.invalidate(); // Invalidate session
        return ResponseEntity.ok().build(); // Successfully logged out
    }

    // Retrieve currently logged-in employee information
    @GetMapping("/employee")
    public ResponseEntity<Employee> getEmployee(HttpSession session) {
        Employee employee = (Employee) session.getAttribute("employee");
        if (employee != null) {
            return ResponseEntity.ok(employee);
        } else {
            // Temporary code for development (default admin login)
            // Employee employeeTmp = employeeRepository
            //         .findByEmployeeIdAndEmployeePw("admin", "admin")
            //         .orElse(null);
            // session.setAttribute("employee", employeeTmp);
            // return ResponseEntity.ok(employeeTmp);

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    // Retrieve full employee list
    // @GetMapping("/employeeList")
    // public ResponseEntity<List<Employee>> getAllEmployees() {
    //     List<Employee> employeeList = employeeService.getAllEmployees();
    //     return ResponseEntity.ok(employeeList);
    // }

    // Show paginated list of currently employed employees
    @GetMapping("/employeeList")
    public ResponseEntity<Page<Employee>> getAllEmployees(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<Employee> employeePage = employeeService.getPageEmployees(page, size);
        return ResponseEntity.ok(employeePage);
    }

    // Paginated list of resigned employees only
    @GetMapping("/employeeListY")
    public ResponseEntity<Page<Employee>> getAllEmployeesY(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<Employee> employeePage = employeeService.getPageEmployeesY(page, size);
        return ResponseEntity.ok(employeePage);
    }

    // Logical deletion of selected employees from employee list screen
    @PostMapping("/deleteEmployees")
    public ResponseEntity<?> deleteEmployees(@RequestBody List<String> ids) {
        employeeService.deleteLogicalEmployees(ids);
        return ResponseEntity.ok("Employees deleted successfully");
    }

    // View all employees including resigned employees
    @GetMapping("/allEmployees")
    public ResponseEntity<Page<Employee>> getAllEmployeesWithResigned(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<Employee> employeePage = employeeService.getAllPageEmployees(page, size);
        return ResponseEntity.ok(employeePage);
    }

    // Register a new employee from modal
    @PostMapping("/registerEmployee")
    public ResponseEntity<String> registerEmployee(@RequestBody EmployeeDTO employeeDTO) {
        if (employeeService.existsByEmployeeId(employeeDTO.getEmployeeId())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("This ID already exists.");
        }
        employeeService.registerEmployee(employeeDTO);
        return ResponseEntity.ok("Employee registered successfully.");
    }

    // Update employee information
    @PutMapping("/updateEmployee/{employeeId}")
    public ResponseEntity<String> updateEmployee(
            @PathVariable String employeeId,
            @RequestBody EmployeeDTO employeeDTO) {
        employeeService.updateEmployee(employeeId, employeeDTO);
        return ResponseEntity.ok("Employee information updated successfully.");
    }

    // Delete employee from edit modal (logical delete)
    @PutMapping("/deleteEmployee/{employeeId}")
    public ResponseEntity<String> deleteEmployee(@PathVariable String employeeId) {
        employeeService.deleteLogicalEmployee(employeeId);
        return ResponseEntity.ok("Employee logically deleted.");
    }

    // Duplicate ID check
    @GetMapping("/checkEmployeeId")
    public ResponseEntity<Boolean> checkEmployeeId(@RequestParam String employeeId) {
        boolean exists = employeeService.existsByEmployeeId(employeeId);
        return ResponseEntity.ok(exists);
    }

    // API to return total employee count
    @GetMapping("/employeeCount")
    public long getTotalEmployeeCount() {
        return employeeService.getTotalEmployeeCount();
    }

    @GetMapping("/employeeRecentCount")
    public ResponseEntity<Long> getRecentHiresCount() {
        try {
            int days = 30; // Last 30 days
            long recentHiresCount = employeeService.getRecentHiresCount(days); // Call service
            return ResponseEntity.ok(recentHiresCount); // Successfully return count
        } catch (Exception e) {
            // If an exception occurs, return 500 error with null response
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/employeeCountDeleted")
    public long getCountOfDeletedEmployeesLast30Days() {
        return employeeService.countDeletedEmployeesLast30Days();
    }
}
