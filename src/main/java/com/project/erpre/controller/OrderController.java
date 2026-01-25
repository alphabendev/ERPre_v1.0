package com.project.erpre.controller;

import com.project.erpre.model.*;
import com.project.erpre.repository.CustomerRepository;
import com.project.erpre.repository.EmployeeRepository;
import com.project.erpre.service.OrderService;
import com.project.erpre.service.ProductService;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/order")
public class OrderController {

    private static final Logger logger = LoggerFactory.getLogger(PriceController.class); // Logger declaration

    @Autowired
    private OrderService orderDTOService;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private ProductService productService;

    @Autowired
    private OrderService orderService;

    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody OrderDTO orderDTO) {
        try {

            // Look up Customer and Employee by ID
            if (orderDTO.getCustomer() != null && orderDTO.getCustomer().getCustomerNo() != null) {
                Customer customer = customerRepository.findById(orderDTO.getCustomer().getCustomerNo())
                        .orElseThrow(() -> new RuntimeException("Customer does not exist."));
                orderDTO.setCustomer(customer);
            }

            if (orderDTO.getEmployee() != null && orderDTO.getEmployee().getEmployeeId() != null) {
                Employee employee = employeeRepository.findById(orderDTO.getEmployee().getEmployeeId())
                        .orElseThrow(() -> new RuntimeException("Employee does not exist."));
                orderDTO.setEmployee(employee);
            }

            // Check for null values before saving
            if (orderDTO.getCustomer() == null || orderDTO.getEmployee() == null) {
                throw new RuntimeException("Both customer and employee information must be provided to create an order.");
            }

            // Process and save through service
            Order savedOrder = orderDTOService.createOrder(orderDTO);
            return new ResponseEntity<>(savedOrder, HttpStatus.CREATED);

        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Search API
    @GetMapping("/search")
    public List<Product> searchProducts(
            @RequestParam(required = false) String productCd,
            @RequestParam(required = false) String productNm,
            @RequestParam(required = false) Integer topCategory,
            @RequestParam(required = false) Integer middleCategory,
            @RequestParam(required = false) Integer lowCategory) {
        return productService.searchProducts(productCd, productNm, topCategory, middleCategory, lowCategory);
    }

    @GetMapping
    public ResponseEntity<?> searchOrder(@RequestParam Integer no) {
        try {
            OrderDTO orderDTO = orderDTOService.getOrderHeaderById(no);
            if (orderDTO == null) {
                return new ResponseEntity<>("Order not found.", HttpStatus.NOT_FOUND);
            }
            return new ResponseEntity<>(orderDTO, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error occurred while retrieving order: ", e);
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{orderNo}")
    public ResponseEntity<?> updateOrder(@PathVariable Integer orderNo, @RequestBody OrderDTO orderDTO) {
        try {
            // Call order update service
            Order updatedOrder = orderService.updateOrder(orderNo, orderDTO);

            if (orderDTO.getDeletedDetailIds() != null && !orderDTO.getDeletedDetailIds().isEmpty()) {
                for (Integer detailId : orderDTO.getDeletedDetailIds()) {
                    orderService.deleteOrderDetail(orderNo, detailId);
                }
            }

            return new ResponseEntity<>(updatedOrder, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error occurred while updating order: ", e);
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Retrieve all orders
    @GetMapping("/all")
    public List<Order> getAllOrders() {
        return orderService.getAllOrders();
    }

    // Retrieve orders filtered by a specific status
    @GetMapping("/status")
    public List<Order> getOrdersByStatus(@RequestParam String status) {
        return orderService.getOrdersByStatus(status);
    }

    // Search orders by customer name
    @GetMapping("/customer")
    public List<Order> getOrdersByCustomerName(@RequestParam String customerName) {
        return orderService.getOrdersByCustomerName(customerName);
    }

    // Search orders by order date
    @GetMapping("/date")
    public List<Order> getOrdersByOrderDate(@RequestParam String orderDate) {
        return orderService.getOrdersByOrderDate(orderDate);
    }

    // Order status update endpoint
    @PatchMapping("/updateStatus/{orderNo}")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Integer orderNo, @RequestBody OrderDTO orderDTO) {
        try {
            // Retrieve order entity
            Order existingOrder = orderService.getOrderById(orderNo);
            if (existingOrder == null) {
                return new ResponseEntity<>("Order not found.", HttpStatus.NOT_FOUND);
            }

            // Update status from DTO
            existingOrder.setOrderHStatus(orderDTO.getOrderHStatus());
            existingOrder.setOrderHUpdateDate(LocalDateTime.now());

            // Save updated entity
            Order updatedOrder = orderService.updateOrder(existingOrder);
            return new ResponseEntity<>(updatedOrder, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error occurred while updating order status: ", e);
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Add order detail item
    @PostMapping("/{orderNo}/details")
    public ResponseEntity<?> addOrderDetail(@PathVariable Integer orderNo, @RequestBody OrderDetailDTO orderDetailDTO) {
        try {
            // Check if order exists
            Order existingOrder = orderService.getOrderById(orderNo);
            if (existingOrder == null) {
                return new ResponseEntity<>("Order not found.", HttpStatus.NOT_FOUND);
            }

            // Add order detail item
            OrderDetail addedDetail = orderService.addOrderDetail(orderNo, orderDetailDTO);
            return new ResponseEntity<>(addedDetail, HttpStatus.CREATED);
        } catch (Exception e) {
            logger.error("Error occurred while adding order detail: ", e);
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Delete order detail item
    @DeleteMapping("/{orderNo}/details/{detailId}")
    public ResponseEntity<?> deleteOrderDetail(@PathVariable Integer orderNo, @PathVariable Integer detailId) {
        try {
            // Check if order exists
            Order existingOrder = orderService.getOrderById(orderNo);
            if (existingOrder == null) {
                return new ResponseEntity<>("Order not found.", HttpStatus.NOT_FOUND);
            }

            // Delete order detail item
            orderService.deleteOrderDetail(orderNo, detailId);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT); // Indicates successful deletion
        } catch (Exception e) {
            logger.error("Error occurred while deleting order detail: ", e);
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/count")
    public long getOrderCount() {
        return orderService.getTotalOrderCount();
    }

    // Retrieve order count by status
    @GetMapping("/status/count")
    public ResponseEntity<?> getOrderCountByStatus() {
        try {
            // Count orders by status: in progress (ing), approved, denied
            long ingCount = orderService.countOrdersByStatus("ing");
            long approvedCount = orderService.countOrdersByStatus("approved");
            long deniedCount = orderService.countOrdersByStatus("denied");

            // Return result as an object
            return new ResponseEntity<>(new OrderStatusCount(ingCount, approvedCount, deniedCount), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Settlement information retrieval API
    @GetMapping("/settlement")
    public ResponseEntity<?> getSettlementInfo() {
        try {
            BigDecimal approvedTotal = orderService.getApprovedTotalAmount();
            BigDecimal ingTotal = orderService.getIngTotalAmount();
            String settlementDeadline = orderService.getSettlementDeadline();

            SettlementResponse response = new SettlementResponse(approvedTotal, ingTotal, settlementDeadline);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error occurred while retrieving settlement information: ", e);
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/annual")
    public BigDecimal getTotalSalesLastYear() {
        return orderService.getTotalSalesLastYear();
    }

    // Calculate sales for the last 30 days starting from today
    @GetMapping("/lastMonth")
    public BigDecimal getTotalSalesLast30Days() {
        return orderService.getTotalSalesLast30Days();
    }

    // DTO class to hold settlement total amounts
    @Data
    @AllArgsConstructor
    static class SettlementTotalsResponse {
        private BigDecimal approvedTotal;
        private BigDecimal deniedTotal;
    }

    // DTO class to hold settlement information
    @Data
    @AllArgsConstructor
    static class SettlementResponse {
        private BigDecimal approvedTotal;
        private BigDecimal deniedTotal;
        private String settlementDeadline;
    }

    // DTO class to hold order counts by status
    @Data
    @AllArgsConstructor
    static class OrderStatusCount {
        private long ingCount;
        private long approvedCount;
        private long deniedCount;
    }
}
