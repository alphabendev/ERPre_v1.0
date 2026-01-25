package com.project.erpre.service;

import com.project.erpre.model.Customer;
import com.project.erpre.model.CustomerDTO;
import com.project.erpre.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;

@Service
public class CustomerService {

    @Autowired
    private CustomerRepository customerRepository;

    // Method to convert CustomerDTO to Customer entity
    private Customer convertToEntity(CustomerDTO customerDTO) {
        Customer customer = new Customer();
        customer.setCustomerNo(customerDTO.getCustomerNo());
        customer.setCustomerName(customerDTO.getCustomerName());
        customer.setCustomerTel(customerDTO.getCustomerTel());
        customer.setCustomerRepresentativeName(customerDTO.getCustomerRepresentativeName());
        customer.setCustomerBusinessRegNo(customerDTO.getCustomerBusinessRegNo());
        customer.setCustomerAddr(customerDTO.getCustomerAddr());
        customer.setCustomerFaxNo(customerDTO.getCustomerFaxNo());
        customer.setCustomerManagerName(customerDTO.getCustomerManagerName());
        customer.setCustomerManagerEmail(customerDTO.getCustomerManagerEmail());
        customer.setCustomerManagerTel(customerDTO.getCustomerManagerTel());
        customer.setCustomerCountryCode(customerDTO.getCustomerCountryCode());
        customer.setCustomerType(customerDTO.getCustomerType());
        customer.setCustomerEtaxInvoiceYn(customerDTO.getCustomerEtaxInvoiceYn());
        // customer.setPrices(customerDTO.getPrices()); // error
        return customer;
    }

    // Method to convert Customer entity to CustomerDTO
    private CustomerDTO convertToDTO(Customer customer) {
        return CustomerDTO.builder()
                .customerNo(customer.getCustomerNo())
                .customerName(customer.getCustomerName())
                .customerTel(customer.getCustomerTel())
                .customerRepresentativeName(customer.getCustomerRepresentativeName())
                .customerBusinessRegNo(customer.getCustomerBusinessRegNo())
                .customerAddr(customer.getCustomerAddr())
                .customerFaxNo(customer.getCustomerFaxNo())
                .customerManagerName(customer.getCustomerManagerName())
                .customerManagerEmail(customer.getCustomerManagerEmail())
                .customerManagerTel(customer.getCustomerManagerTel())
                .customerCountryCode(customer.getCustomerCountryCode())
                .customerType(customer.getCustomerType())
                .customerEtaxInvoiceYn(customer.getCustomerEtaxInvoiceYn())
                // .prices(customer.getPrices()); // error
                .build();
    }

    // Retrieve all customers
    public List<Customer> getList() {
        return customerRepository.findAll();
    }

    // Retrieve all customers, including deleted ones
    public List<Customer> getCustomersByDeleteYn(String deleteYn) {
        if (deleteYn == null) {
            return customerRepository.findAll(); // Retrieve all customers
        } else {
            return customerRepository.findByCustomerDeleteYn(deleteYn); // Filter by deleteYn value
        }
    }

    // Add a new customer
    public Customer insertCustomer(Customer customer) {
        customer.setCustomerDeleteYn("N"); // Default value: N
        customer.setCustomerInsertDate(new Timestamp(System.currentTimeMillis())); // Record insert timestamp
        return customerRepository.save(customer); // Save the new customer
    }

    // Update customer information
    public Customer updateCustomer(Integer customerNo, Customer updatedCustomer) {
        Optional<Customer> existingCustomerOptional = customerRepository.findById(customerNo);
        if (existingCustomerOptional.isPresent()) {
            Customer existingCustomer = existingCustomerOptional.get();

            // Apply updated fields
            existingCustomer.setCustomerName(updatedCustomer.getCustomerName());
            existingCustomer.setCustomerTel(updatedCustomer.getCustomerTel());
            existingCustomer.setCustomerRepresentativeName(updatedCustomer.getCustomerRepresentativeName());
            existingCustomer.setCustomerBusinessRegNo(updatedCustomer.getCustomerBusinessRegNo());
            existingCustomer.setCustomerAddr(updatedCustomer.getCustomerAddr());
            existingCustomer.setCustomerFaxNo(updatedCustomer.getCustomerFaxNo());
            existingCustomer.setCustomerManagerName(updatedCustomer.getCustomerManagerName());
            existingCustomer.setCustomerManagerEmail(updatedCustomer.getCustomerManagerEmail());
            existingCustomer.setCustomerManagerTel(updatedCustomer.getCustomerManagerTel());
            existingCustomer.setCustomerCountryCode(updatedCustomer.getCustomerCountryCode());
            existingCustomer.setCustomerType(updatedCustomer.getCustomerType());
            existingCustomer.setCustomerEtaxInvoiceYn(updatedCustomer.getCustomerEtaxInvoiceYn());
            existingCustomer.setCustomerTransactionStartDate(updatedCustomer.getCustomerTransactionStartDate());
            existingCustomer.setCustomerTransactionEndDate(updatedCustomer.getCustomerTransactionEndDate());

            existingCustomer.setCustomerUpdateDate(new Timestamp(System.currentTimeMillis())); // Record update timestamp
            return customerRepository.save(existingCustomer); // Save updated customer
        } else {
            throw new RuntimeException("Customer not found with customerNo: " + customerNo);
        }
    }

    // Delete customer (soft delete)
    public void deleteCustomer(Integer customerNo) {
        Optional<Customer> existingCustomerOptional = customerRepository.findById(customerNo);
        if (existingCustomerOptional.isPresent()) {
            Customer customer = existingCustomerOptional.get();
            customer.setCustomerDeleteYn("Y");
            customer.setCustomerDeleteDate(new Timestamp(System.currentTimeMillis())); // Record delete timestamp
            customerRepository.save(customer); // Save delete status
        } else {
            throw new RuntimeException("Customer not found with customerNo: " + customerNo);
        }
    }

    // Search customers by name
    public List<Customer> searchCustomers(String name) {
        return customerRepository.findByCustomerNameContainingIgnoreCase(name);
    }

    // Main - total number of customers (excluding deleted)
    public Long getTotalCustomer() {
        return customerRepository.countByCustomerDeleteYn("N");
    }

    // Main - recent new customers (registered within the last 3 days)
    public List<Customer> getRecentCustomer() {
        Timestamp threeDaysAgo = new Timestamp(System.currentTimeMillis() - 3L * 24 * 60 * 60 * 1000);
        return customerRepository.findByCustomerInsertDateAfterAndCustomerDeleteYn(threeDaysAgo, "N");
    }

    // Main - customers with upcoming contract renewal (transactionEndDate within 3 days from today)
    public List<Customer> getRenewalCustomer() {
        Timestamp today = new Timestamp(System.currentTimeMillis());
        Timestamp targetDate = new Timestamp(today.getTime() + 3L * 24 * 60 * 60 * 1000);
        return customerRepository.findByCustomerTransactionEndDateBetweenAndCustomerDeleteYn(today, targetDate, "N");
    }

    // Validation - check for duplicate customer name
    public boolean isDuplicateCustomerName(String customerName) {
        return customerRepository.existsByCustomerName(customerName);
    }

    // Validation - check for duplicate business registration number
    public boolean isDuplicateBusinessRegNo(String customerBusinessRegNo) {
        return customerRepository.existsByCustomerBusinessRegNo(customerBusinessRegNo);
    }
}
