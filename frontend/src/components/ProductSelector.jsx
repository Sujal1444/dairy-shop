import { useState, useRef, useEffect } from "react";

function ProductSelector({ products, value, onChange, error }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);

  const selectedProduct = products.find((p) => p._id === value);
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (product) => {
    onChange(product._id);
    setSearch("");
    setIsOpen(false);
  };

  return (
    <div className="product-selector-container" ref={dropdownRef}>
      <div
        className={`selector-display ${isOpen ? "open" : ""} ${error ? "input-err" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedProduct ? (
          <div className="selected-info">
            <span className="selected-name">{selectedProduct.name}</span>
            <span className="selected-meta">{selectedProduct.unit}</span>
          </div>
        ) : (
          <span className="placeholder">-- Select Product --</span>
        )}
        <span className="chevron">{isOpen ? "▲" : "▼"}</span>
      </div>

      {isOpen && (
        <div className="selector-dropdown">
          <input
            type="text"
            className="selector-search"
            placeholder="Search product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
          <div className="selector-options">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((p) => (
                <div
                  key={p._id}
                  className={`selector-option ${p._id === value ? "active" : ""}`}
                  onClick={() => handleSelect(p)}
                >
                  <div className="option-info">
                    <span className="option-name">{p.name}</span>
                    <span className="option-cat">{p.category}</span>
                  </div>
                  <span className="option-price">₹{p.price}/{p.unit}</span>
                </div>
              ))
            ) : (
              <div className="no-results">No products found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductSelector;
