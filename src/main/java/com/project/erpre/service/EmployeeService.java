package com.project.erpre.service;

import com.project.erpre.model.Employee;
import com.project.erpre.model.EmployeeDTO;
import com.project.erpre.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.List;

@Service
public class EmployeeService {

    @Autowired
    private EmployeeRepository employeeRepository;

    // Method to convert EmployeeDTO to Employee entity
    private Employee convertToEntity(EmployeeDTO employeeDTO) {
        Employee employee = new Employee();
        employee.setEmployeeId(employeeDTO.getEmployeeId());
        employee.setEmployeePw(employeeDTO.getEmployeePw());
        employee.setEmployeeName(employeeDTO.getEmployeeName());
        employee.setEmployeeEmail(employeeDTO.getEmployeeEmail());
        employee.setEmployeeTel(employeeDTO.getEmployeeTel());
        employee.setEmployeeRole(employeeDTO.getEmployeeRole());
        employee.setEmployeeInsertDate(employeeDTO.getEmployeeInsertDate());
        employee.setEmployeeUpdateDate(employeeDTO.getEmployeeUpdateDate());
        employee.setEmployeeDeleteYn(employeeDTO.getEmployeeDeleteYn());
        employee.setEmployeeDeleteDate(employeeDTO.getEmployeeDeleteDate());
        return employee;
    }

    // Method to convert Employee entity to EmployeeDTO
    private EmployeeDTO convertToDTO(Employee employee) {
        return EmployeeDTO.builder()
                .employeeId(employee.getEmployeeId())
                .employeePw(employee.getEmployeePw())
                .employeeName(employee.getEmployeeName())
                .employeeEmail(employee.getEmployeeEmail())
                .employeeTel(employee.getEmployeeTel())
                .employeeRole(employee.getEmployeeRole())
                .employeeInsertDate(employee.getEmployeeInsertDate())
                .employeeUpdateDate(employee.getEmployeeUpdateDate())
                .employeeDeleteYn(employee.getEmployeeDeleteYn())
                .employeeDeleteDate(employee.getEmployeeDeleteDate())
                .build();
    }

    // Retrieve only active employees (not deleted)
    public Page<Employee> getPageEmployees(int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size);
        return employeeRepository.findByEmployeeDeleteYn("N", pageable);
    }

    // Retrieve all employees including retired/deleted
    public Page<Employee> getAllPageEmployees(int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size);
        return employeeRepository.findAll(pageable);
    }

    // Retrieve only retired/deleted employees
    public Page<Employee> getPageEmployeesY(int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size);
        return employeeRepository.findByEmployeeDeleteYn("Y", pageable);
    }

    // Logical deletion for multiple employees (set delete flag)
    public void deleteLogicalEmployees(List<String> ids) {
        for (String id : ids) {
            Employee employee = employeeRepository.findById(id).orElse(null);
            if (employee != null) {
                employee.setEmployeeDeleteYn("Y");
                employee.setEmployeeDeleteDate(new Timestamp(System.currentTimeMillis()));
                employeeRepository.save(employee);  // Update N -> Y
            }
        }
    }

    // Register a new employee
    public void registerEmployee(EmployeeDTO employeeDTO) {
        Employee employee = Employee.builder()
                .employeeId(employeeDTO.getEmployeeId())
                .employeePw(employeeDTO.getEmployeePw())
                .employeeName(employeeDTO.getEmployeeName())
                .employeeEmail(employeeDTO.getEmployeeEmail())
                .employeeTel(employeeDTO.getEmployeeTel())
                .employeeRole(employeeDTO.getEmployeeRole())
                .employeeDeleteYn("N")  // Set default value
                .employeeInsertDate(new Timestamp(System.currentTimeMillis()))
                .build();

        employeeRepository.save(employee);
    }

    // Update employee information from edit modal
    public void updateEmployee(String employeeId, EmployeeDTO employeeDTO) {
        Employee employee = employeeRepository.findById(employeeId).orElse(null);
        if (employee != null) {
            employee.setEmployeePw(employeeDTO.getEmployeePw());
            employee.setEmployeeName(employeeDTO.getEmployeeName());
            employee.setEmployeeEmail(employeeDTO.getEmployeeEmail());
            employee.setEmployeeTel(employeeDTO.getEmployeeTel());
            employee.setEmployeeRole(employeeDTO.getEmployeeRole());
            employee.setEmployeeUpdateDate(new Timestamp(System.currentTimeMillis()));  // Update modification date
            employeeRepository.save(employee);  // Save updated info
        }
    }

    // Logical delete of employee from edit modal
    public void deleteLogicalEmployee(String employeeId) {
        Employee employee = employeeRepository.findById(employeeId).orElse(null);
        if (employee != null) {
            employee.setEmployeeDeleteYn("Y");
            employee.setEmployeeDeleteDate(new Timestamp(System.currentTimeMillis()));  // Update deletion date
            employeeRepository.save(employee);  // Save logical deletion
        }
    }

    // Check for duplicate employee ID
    public boolean existsByEmployeeId(String employeeId) {
        return employeeRepository.existsById(employeeId);
    }

    // Get total number of employees
    public long getTotalEmployeeCount() {
        return employeeRepository.count();
    }

    // Get number of employees hired in the last 'days' days
    public long getRecentHiresCount(int days) {
        return employeeRepository.countRecentHires(days);
    }

    // Get number of employees retired/deleted in the last 30 days
    public long countDeletedEmployeesLast30Days() {
        return employeeRepository.countDeletedEmployeesLast30Days();
    }
}
