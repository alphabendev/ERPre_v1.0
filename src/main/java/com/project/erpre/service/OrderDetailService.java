package com.project.erpre.service;

import com.project.erpre.model.Order;
import com.project.erpre.model.OrderDetail;
import com.project.erpre.model.OrderDetailDTO;
import com.project.erpre.model.Product;
import com.project.erpre.repository.OrderDetailRepository;
import com.project.erpre.repository.OrderRepository;
import com.project.erpre.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class OrderDetailService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderDetailRepository orderDetailRepository;

    // Convert OrderDetailDTO to OrderDetail entity
    public OrderDetail convertToEntity(OrderDetailDTO orderDetailDTO) {
        OrderDetail orderDetail = OrderDetail.builder()
                .orderNo(orderDetailDTO.getOrderNo())
                .orderDPrice(orderDetailDTO.getOrderDPrice())
                .orderDQty(orderDetailDTO.getOrderDQty())
                .orderDTotalPrice(orderDetailDTO.getOrderDTotalPrice())
                .orderDDeliveryRequestDate(orderDetailDTO.getOrderDDeliveryRequestDate())
                .orderDInsertDate(orderDetailDTO.getOrderDInsertDate())
                .orderDUpdateDate(orderDetailDTO.getOrderDUpdateDate())
                .orderDDeleteYn(Optional.ofNullable(orderDetailDTO.getOrderDDeleteYn()).orElse("N")) // default 'N'
                .orderDDeleteDate(orderDetailDTO.getOrderDDeleteDate())
                .build();

        // Set associated Order and Product entities
        orderDetail.setOrder(orderRepository.findById(orderDetailDTO.getOrderNo()).orElse(null));
        orderDetail.setProduct(productRepository.findById(orderDetailDTO.getProductCd()).orElse(null));

        return orderDetail;
    }

    // Convert OrderDetail entity to OrderDetailDTO
    public OrderDetailDTO convertToDTO(OrderDetail orderDetail) {
        return OrderDetailDTO.builder()
                .orderNo(orderDetail.getOrderNo())
                .orderHNo(orderDetail.getOrder().getOrderNo())
                .productCd(orderDetail.getProduct().getProductCd())
                .orderDPrice(orderDetail.getOrderDPrice())
                .orderDQty(orderDetail.getOrderDQty())
                .orderDTotalPrice(orderDetail.getOrderDTotalPrice())
                .orderDDeliveryRequestDate(orderDetail.getOrderDDeliveryRequestDate())
                .orderDInsertDate(orderDetail.getOrderDInsertDate())
                .orderDUpdateDate(orderDetail.getOrderDUpdateDate())
                .orderDDeleteYn(orderDetail.getOrderDDeleteYn())
                .orderDDeleteDate(orderDetail.getOrderDDeleteDate())
                .build();
    }

    // Create a single order detail
    public OrderDetail createOrderDetail(OrderDetail orderDetail) {
        return orderDetailRepository.save(orderDetail);
    }

    // Create multiple order details
    public List<OrderDetail> createOrderDetails(List<OrderDetail> orderDetails) {
        return orderDetailRepository.saveAll(orderDetails);
    }

    // Retrieve an order detail by ID
    public Optional<OrderDetail> getOrderDetailById(Integer id) {
        return orderDetailRepository.findById(id);
    }

    // Retrieve all order details
    public List<OrderDetail> getAllOrderDetails() {
        return orderDetailRepository.findAll();
    }

    // Update an existing order detail
    public OrderDetail updateOrderDetail(OrderDetail orderDetail) {
        return orderDetailRepository.save(orderDetail);
    }

    // Delete an order detail and recalculate order total
    public boolean deleteOrderDetail(Integer id) {
        OrderDetail orderDetail = orderDetailRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order detail not found."));

        // Delete the order detail
        orderDetailRepository.delete(orderDetail);

        // Recalculate total order price
        Order order = orderDetail.getOrder();
        order.recalculateTotalPrice();
        orderRepository.save(order);

        return true;
    }

    // Update an order detail using DTO
    public OrderDetail updateOrderDetail(Integer id, OrderDetailDTO orderDetailDTO) {
        OrderDetail existingOrderDetail = orderDetailRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order detail not found."));

        // Update only necessary fields
        existingOrderDetail.setOrderDPrice(orderDetailDTO.getOrderDPrice());
        existingOrderDetail.setOrderDQty(orderDetailDTO.getOrderDQty());
        existingOrderDetail.setOrderDTotalPrice(orderDetailDTO.getOrderDTotalPrice());
        existingOrderDetail.setOrderDUpdateDate(LocalDateTime.now());
        existingOrderDetail.setOrderDDeliveryRequestDate(orderDetailDTO.getOrderDDeliveryRequestDate());

        // Update associated Order and Product entities
        existingOrderDetail.setOrder(orderRepository.findById(orderDetailDTO.getOrderNo()).orElse(null));
        existingOrderDetail.setProduct(productRepository.findById(orderDetailDTO.getProductCd()).orElse(null));

        return orderDetailRepository.save(existingOrderDetail);
    }

    // Create an order detail from DTO with validation
    public OrderDetail createOrderDetail(OrderDetailDTO orderDetailDTO) {
        if (orderDetailDTO.getProductCd() == null) {
            throw new IllegalArgumentException("Product code is required.");
        }
        OrderDetail orderDetail = convertToEntity(orderDetailDTO);
        return orderDetailRepository.save(orderDetail);
    }

    // Retrieve all order details for a specific order
    public List<OrderDetail> getOrderDetailsByOrderNo(Integer orderNo) {
        Order existingOrder = orderRepository.findById(orderNo)
                .orElseThrow(() -> new RuntimeException("Order not found."));

        return orderDetailRepository.findByOrderOrderNo(orderNo);
    }

    // Get total quantity of all orders
    public Long getTotalOrderQuantity() {
        return orderDetailRepository.sumOrderDQty();
    }
}
