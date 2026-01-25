package com.project.erpre.controller;

import com.project.erpre.model.Customer;
import com.project.erpre.service.CustomerService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/customer")
public class CustomerController {

    private static final Logger logger = LoggerFactory.getLogger(CustomerController.class); // Logger declaration

    @Autowired
    private CustomerService customerService;

    // Retrieve full customer list
    @GetMapping("/getList")
    public List<Customer> getList() {
        logger.info("Retrieve full customer list");
        return customerService.getList();
    }

    // Retrieve all customers and deleted customers list
    @GetMapping("/getListByDeleteYn") // Path modified (duplicate removed)
    public ResponseEntity<List<Customer>> getCustomers(@RequestParam(required = false) String deleteYn) {
        List<Customer> customers = customerService.getCustomersByDeleteYn(deleteYn);
        return ResponseEntity.ok(customers);
    }

    // Register customer information
    @PostMapping("/register")
    public Customer insertCustomer(@RequestBody Customer customer) {
        logger.info("Register customer");
        return customerService.insertCustomer(customer);
    }

    // Update customer information
    @PutMapping("/update/{customerNo}")
    public Customer updateCustomer(@PathVariable Integer customerNo, @RequestBody Customer updatedCustomer) {
        logger.info("Update customer information");
        return customerService.updateCustomer(customerNo, updatedCustomer);
    }

    // Delete customer
    @DeleteMapping("/delete/{customerNo}")
    public void deleteCustomer(@PathVariable Integer customerNo) {
        logger.info("Delete customer: customerNo=" + customerNo);
        customerService.deleteCustomer(customerNo);
    }

    // Search customer by name
    @GetMapping("/search")
    public List<Customer> searchCustomers(@RequestParam("name") String name) {
        return customerService.searchCustomers(name);
    }

    // Main - total number of customers
    @GetMapping("/count")
    public ResponseEntity<Long> getTotalCustomer() {
        Long count = customerService.getTotalCustomer();
        return ResponseEntity.ok(count);
    }

    // Main - recent new customers (registered from today up to 3 days ago)
    @GetMapping("/recent")
    public ResponseEntity<List<Customer>> getRecentCustomer() {
        List<Customer> recentCustomer = customerService.getRecentCustomer();
        return ResponseEntity.ok(recentCustomer);
    }

    // Main - upcoming contract renewals (customers with transaction end date 3 days from today)
    @GetMapping("/renewals")
    public ResponseEntity<List<Customer>> getRenewalCustomer() {
        List<Customer> renewalCustomer = customerService.getRenewalCustomer();
        return ResponseEntity.ok(renewalCustomer);
    }

    // Validation check
    @PostMapping("/checkDuplicate")
    public ResponseEntity<Map<String, Boolean>> checkDuplicate(@RequestBody Map<String, String> requestData) {
        String customerName = requestData.get("customerName");
        String customerBusinessRegNo = requestData.get("customerBusinessRegNo");

        boolean isDuplicateName = customerService.isDuplicateCustomerName(customerName);
        boolean isDuplicateBusinessRegNo = customerService.isDuplicateBusinessRegNo(customerBusinessRegNo);

        Map<String, Boolean> response = new HashMap<>();
        response.put("isDuplicateName", isDuplicateName);
        response.put("isDuplicateBusinessRegNo", isDuplicateBusinessRegNo);

        return ResponseEntity.ok(response);
    }
}
