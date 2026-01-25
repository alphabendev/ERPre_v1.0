package com.project.erpre.controller;

import com.project.erpre.model.Order;
import com.project.erpre.model.OrderDetail;
import com.project.erpre.model.OrderDetailDTO;
import com.project.erpre.model.Product;
import com.project.erpre.repository.OrderDetailRepository;
import com.project.erpre.repository.OrderRepository;
import com.project.erpre.repository.ProductRepository;
import com.project.erpre.service.OrderDetailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
public class OrderDetailController {

    private static final Logger logger = LoggerFactory.getLogger(OrderDetailController.class);

    @Autowired
    private OrderDetailService orderDetailService;

    @PostMapping(value = "/api/orderDetails")
    public ResponseEntity<?> createOrderDetail(@RequestBody OrderDetailDTO orderDetailDTO) {

        try {
            // Convert DTO -> Entity
            OrderDetail orderDetail = orderDetailService.convertToEntity(orderDetailDTO);

            // Save entity
            OrderDetail savedOrderDetail = orderDetailService.createOrderDetail(orderDetail);

            return new ResponseEntity<>(savedOrderDetail, HttpStatus.CREATED);

        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping(value = "/api/orderDetails/batch")
    public ResponseEntity<?> createOrderDetails(@RequestBody List<OrderDetailDTO> orderDetailDTOList) {
        try {
            // Convert DTO list -> Entity list
            List<OrderDetail> orderDetailList = orderDetailDTOList.stream()
                    .map(orderDetailService::convertToEntity)
                    .collect(Collectors.toList());

            // Save entity list (batch save possible)
            List<OrderDetail> savedOrderDetails = orderDetailService.createOrderDetails(orderDetailList);

            return new ResponseEntity<>(savedOrderDetails, HttpStatus.CREATED);

        } catch (Exception e) {
            logger.error("Error occurred while saving order details in batch: ", e);
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Existing single order detail processing endpoint can be kept

    @PutMapping("/api/orderDetails/{id}")
    public ResponseEntity<?> updateOrderDetail(@PathVariable Integer id, @RequestBody OrderDetailDTO orderDetailDTO) {
        try {
            OrderDetail updatedOrderDetail = orderDetailService.updateOrderDetail(id, orderDetailDTO);
            return new ResponseEntity<>(updatedOrderDetail, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error occurred while updating order detail: ", e);
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/api/orderDetails/{id}")
    public ResponseEntity<?> deleteOrderDetail(@PathVariable Integer id) {
        try {
            boolean isDeleted = orderDetailService.deleteOrderDetail(id);
            if (isDeleted) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT); // Deletion successful
            } else {
                return new ResponseEntity<>("No item to delete.", HttpStatus.NOT_FOUND); // Item not found
            }
        } catch (Exception e) {
            logger.error("Error occurred while deleting order detail: ", e);
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/api/totalSales")
    public ResponseEntity<Long> getTotalSales() {
        Long totalSales = orderDetailService.getTotalOrderQuantity();
        return ResponseEntity.ok(totalSales);
    }

}
