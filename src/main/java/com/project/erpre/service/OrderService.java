package com.project.erpre.service;

import com.project.erpre.controller.PriceController;
import com.project.erpre.model.*;
import com.project.erpre.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private static final Logger logger = LoggerFactory.getLogger(OrderService.class); // Declare logger

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderDetailRepository orderDetailRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private ProductRepository productRepository;

    // Get all orders
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    // Get orders by status
    public List<Order> getOrdersByStatus(String status) {
        return orderRepository.findByOrderHStatus(status);
    }

    // Search by customer name
    public List<Order> getOrdersByCustomerName(String customerName) {
        return orderRepository.findByCustomerCustomerNameContaining(customerName);
    }

    // Search orders by date
    public List<Order> getOrdersByOrderDate(String orderDate) {
        return orderRepository.findByOrderHInsertDateContaining(orderDate);
    }

    // Get order by specific order number
    public Order getOrderById(Integer orderNo) {
        return orderRepository.findById(orderNo).orElse(null);
    }

    public Order createOrder(OrderDTO orderDTO) {

        // Find customer entity by customer number
        Customer customer = customerRepository.findById(orderDTO.getCustomer().getCustomerNo())
                .orElseThrow(() -> new RuntimeException("Customer information not found."));

        // Handle employee information similarly (find by employee ID)
        Employee employee = employeeRepository.findById(orderDTO.getEmployee().getEmployeeId())
                .orElseThrow(() -> new RuntimeException("Employee information not found."));

        // Convert DTO -> Entity
        Order order = Order.builder()
                .orderNo(orderDTO.getOrderNo()) // Order number
                .employee(orderDTO.getEmployee()) // Employee info
                .customer(orderDTO.getCustomer()) // Customer info
                .orderHTotalPrice(orderDTO.getOrderHTotalPrice()) // Total price
                .orderHStatus(orderDTO.getOrderHStatus()) // Order status
                .orderHDeleteYn("N") // Default value
                .build();

        if (order.getOrderHDeleteYn() == null) {
            order.setOrderHDeleteYn("N"); // Set default
        }

        // Save entity
        return orderRepository.save(order);
    }

    public OrderDTO getOrderHeaderById(Integer orderNo) {
        Order order = orderRepository.findById(orderNo)
                .orElseThrow(() -> new RuntimeException("Order not found."));

        List<OrderDetail> orderDetails = orderDetailRepository.findByOrderOrderNo(orderNo);
        List<Product> products = orderDetails.stream()
                .map(detail -> productRepository.findById(detail.getProduct().getProductCd()).orElse(null))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        OrderDTO orderDTO = OrderDTO.builder()
                .orderNo(order.getOrderNo())
                .employee(order.getEmployee())
                .customer(order.getCustomer())
                .orderHStatus(order.getOrderHStatus())
                .orderHTotalPrice(order.getOrderHTotalPrice())
                .orderHInsertDate(order.getOrderHInsertDate())
                .orderHUpdateDate(order.getOrderHUpdateDate())
                .orderHDeleteYn(order.getOrderHDeleteYn())
                .build();

        orderDTO.setOrderDetails(orderDetails.stream()
                .map(orderDetail -> OrderDetailDTO.builder()
                        .orderNo(orderDetail.getOrderNo())
                        .orderHNo(orderDetail.getOrder().getOrderNo())
                        .productCd(orderDetail.getProduct().getProductCd())
                        .orderDPrice(orderDetail.getOrderDPrice())
                        .orderDQty(orderDetail.getOrderDQty())
                        .orderDTotalPrice(orderDetail.getOrderDTotalPrice())
                        .orderDDeliveryRequestDate(orderDetail.getOrderDDeliveryRequestDate())
                        .build())
                .collect(Collectors.toList()));

        orderDTO.setProducts(products);

        return orderDTO;
    }

    public Order updateOrder(Integer orderNo, OrderDTO orderDTO) {
        Order existingOrder = orderRepository.findById(orderNo)
                .orElseThrow(() -> new RuntimeException("Order information not found."));

        // Update customer and employee info (keep existing logic)
        existingOrder.setCustomer(customerRepository.findById(orderDTO.getCustomer().getCustomerNo()).orElse(null));
        existingOrder.setEmployee(employeeRepository.findById(orderDTO.getEmployee().getEmployeeId()).orElse(null));
        existingOrder.setOrderHTotalPrice(orderDTO.getOrderHTotalPrice());
        existingOrder.setOrderHStatus(orderDTO.getOrderHStatus());
        existingOrder.setOrderHUpdateDate(LocalDateTime.now());
        existingOrder.setOrderHDeleteYn(orderDTO.getOrderHDeleteYn());

        // Update order details (keep existing logic)
        for (OrderDetailDTO detailDTO : orderDTO.getOrderDetails()) {
            OrderDetail existingDetail = orderDetailRepository.findById(detailDTO.getOrderNo())
                    .orElseThrow(() -> new RuntimeException("Order detail not found."));
            existingDetail.setOrderDDeliveryRequestDate(detailDTO.getOrderDDeliveryRequestDate());
            orderDetailRepository.save(existingDetail);
        }

        // Handle deleted order details
        if (orderDTO.getDeletedDetailIds() != null) {
            for (Integer detailId : orderDTO.getDeletedDetailIds()) {
                orderDetailRepository.deleteById(detailId);
            }
        }

        return orderRepository.save(existingOrder);
    }

    // Delete order
    public void deleteOrder(Integer orderNo) {
        orderRepository.deleteById(orderNo);
    }

    public Order updateOrder(Order order) {
        return orderRepository.save(order);
    }

    public OrderDetail addOrderDetail(Integer orderNo, OrderDetailDTO orderDetailDTO) {
        // Check if order exists
        Order existingOrder = orderRepository.findById(orderNo)
                .orElseThrow(() -> new RuntimeException("Order not found."));

        // Convert DTO to entity
        OrderDetail orderDetail = new OrderDetailService().convertToEntity(orderDetailDTO);
        orderDetail.setOrder(existingOrder); // Set order
        return orderDetailRepository.save(orderDetail);
    }

    // Delete order detail
    public void deleteOrderDetail(Integer orderNo, Integer detailId) {
        logger.info("deleteOrderDetail - Order No: {}, Detail to delete: {}", orderNo, detailId); // Delete request log

        // Check if order exists
        Order existingOrder = orderRepository.findById(orderNo)
                .orElseThrow(() -> new RuntimeException("Order not found."));

        logger.info("Order {} existence confirmed", orderNo); // Order confirmation log

        // Delete detail item
        orderDetailRepository.deleteById(detailId);

        logger.info("Order detail {} deleted", detailId); // Deletion complete log
    }

    // Get total order count
    public long getTotalOrderCount() {
        return orderRepository.countOrders();
    }

    // Count orders by specific status
    public long countOrdersByStatus(String status) {
        return orderRepository.countByOrderHStatus(status);
    }

    public BigDecimal getApprovedTotalAmount() {
        LocalDate thirtyDaysAgo = LocalDate.now().minusDays(30);
        LocalDateTime thirtyDaysAgoDateTime = thirtyDaysAgo.atStartOfDay(); // Convert to LocalDateTime
        return orderRepository.sumApprovedOrdersLastMonth(thirtyDaysAgoDateTime);
    }

    public BigDecimal getIngTotalAmount() {
        LocalDate thirtyDaysAgo = LocalDate.now().minusDays(30);
        LocalDateTime thirtyDaysAgoDateTime = thirtyDaysAgo.atStartOfDay(); // Convert to LocalDateTime
        return orderRepository.sumIngOrdersLastMonth(thirtyDaysAgoDateTime);
    }

    public String getSettlementDeadline() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime deadline;

        if (now.getDayOfMonth() > 15) {
            deadline = LocalDateTime.of(now.getYear(), now.getMonth().plus(1), 15, 0, 0);
        } else {
            deadline = LocalDateTime.of(now.getYear(), now.getMonth(), 15, 0, 0);
        }

        return deadline.format(DateTimeFormatter.ofPattern("yyyy MMMM d")); // Format example: "2024 January 15"
    }

    public BigDecimal getTotalSalesLastYear() {
        LocalDateTime oneYearAgo = LocalDateTime.now().minusYears(1);
        return orderRepository.sumIngOrdersLastYear(oneYearAgo);
    }

    // Calculate sales for the last 30 days
    public BigDecimal getTotalSalesLast30Days() {
        LocalDateTime today = LocalDateTime.now(); // Current date and time
        LocalDateTime thirtyDaysAgo = today.minusDays(30); // Date 30 days ago
        return orderRepository.sumTotalSalesForPeriod(thirtyDaysAgo, today);
    }
}
