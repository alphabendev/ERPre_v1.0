// src/main/react/components/common/Pagination.js
import React from 'react';

function Pagination({
                        currentPage,
                        totalPages,
                        itemsPerPage,
                        totalItems,
                        isLoading,
                        pageInputValue,
                        handlePage,
                        handleItemsPerPageChange,
                        handlePageInputChange,
                        handleDeleteSelected, // Handler for deleting selected items
                        selectedItems, // Array of selected items
                        showFilters = true, // Option to determine whether to show the filter section
                    }) {
    return (
        // Center align only the page block if showFilters is false
        <div
            className="pagination-container"
            style={{ justifyContent: !showFilters ? 'space-around' : 'space-between' }}
        >

            {/* Left: Items per page selector, display only when showFilters is true */}
            {
                showFilters && (
                    <div className="pagination-sub left">
                        {/* Display "Delete Selected" button only when there are selected items */}
                        {Array.isArray(selectedItems) && selectedItems.length > 0 && (
                            <button className="box mr10 color_border red" onClick={handleDeleteSelected}>
                                <i className="bi bi-trash3"></i>Delete {selectedItems.length} item(s)
                            </button>
                        )}
                        <input
                            type="number"
                            id="itemsPerPage"
                            className="box"
                            value={itemsPerPage}
                            onChange={handleItemsPerPageChange}
                            min={1}
                            max={100}
                            step={1}
                        />
                        <label htmlFor="itemsPerPage">
                            items per page / <b>{isLoading ? '-' : totalItems}</b> total
                        </label>
                    </div>
                )
            }

            {/* Center: Pagination */}
            <div className="pagination">
                {/* 'First' button */}
                {currentPage > 1 && (
                    <button className="box icon first" onClick={() => handlePage(1)}>
                        <i className="bi bi-chevron-double-left"></i>
                    </button>
                )}

                {/* 'Previous' button */}
                {currentPage > 1 && (
                    <button className="box icon left" onClick={() => handlePage(currentPage - 1)}>
                        <i className="bi bi-chevron-left"></i>
                    </button>
                )}

                {/* Page number block */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
                    const startPage = Math.max(Math.floor((currentPage - 1) / 5) * 5 + 1, 1);
                    const page = startPage + index;
                    return (
                        page <= totalPages && (
                            <button
                                key={page}
                                onClick={() => handlePage(page)}
                                className={currentPage === page ? 'box active' : 'box'}
                            >
                                {page}
                            </button>
                        )
                    );
                })}

                {/* 'Next' button */}
                {currentPage < totalPages && (
                    <button className="box icon right" onClick={() => handlePage(currentPage + 1)}>
                        <i className="bi bi-chevron-right"></i>
                    </button>
                )}

                {/* 'Last' button */}
                {currentPage < totalPages && (
                    <button className="box icon last" onClick={() => handlePage(totalPages)}>
                        <i className="bi bi-chevron-double-right"></i>
                    </button>
                )}
            </div>

            {/* Right: Page number input, display only when showFilters is true */}
            {
                showFilters && (
                    <div className="pagination-sub right">
                        <input
                            type="number"
                            id="pageInput"
                            className="box"
                            value={pageInputValue}
                            onChange={handlePageInputChange}
                            min={1}
                            max={totalPages}
                            step={1}
                        />
                        <label htmlFor="pageInput">/ <b>{totalPages}</b> page(s)</label>
                    </div>
                )
            }

        </div >
    );
}

export default Pagination;