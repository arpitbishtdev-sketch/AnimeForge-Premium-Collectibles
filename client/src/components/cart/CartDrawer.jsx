import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";
import "./cartDrawer.css";

export default function CartDrawer({ open, onClose }) {
  const { items, subtotal } = useCart();
  const navigate = useNavigate();

  return (
    <>
      {open && <div className="cart-overlay" onClick={onClose} />}

      <div className={`cart-drawer ${open ? "open" : ""}`}>
        {/* Header */}
        <div className="cart-drawer-header">
          <div className="cart-drawer-header__left">
            <span className="cart-drawer-header__icon">✦</span>
            <h3 className="cart-drawer-header__title">Your Cart</h3>
            {items.length > 0 && (
              <span className="cart-drawer-header__count">{items.length}</span>
            )}
          </div>
          <button
            className="cart-drawer-close"
            onClick={onClose}
            aria-label="Close cart"
          >
            ✕
          </button>
        </div>

        <div className="cart-drawer-accent-bar" />

        {/* Items */}
        <div className="cart-drawer-items">
          {items.length === 0 ? (
            <div className="drawer-empty">
              <span className="drawer-empty__icon">◎</span>
              <p className="drawer-empty__text">Your cart is empty</p>
              <span className="drawer-empty__sub">
                Add some anime collectibles!
              </span>
            </div>
          ) : (
            <div className="drawer-item-list">
              {items.map((item, i) => (
                <div
                  key={item.id}
                  className="drawer-item"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="drawer-item__img-wrap">
                    <img src={item.image} alt={item.name} />
                  </div>
                  <div className="drawer-item-info">
                    <p className="drawer-item__name">{item.name}</p>
                    <span className="drawer-item__price">
                      ₹{item.price.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="drawer-item__qty">
                    <span className="drawer-item__qty-label">QTY</span>
                    <span className="drawer-item__qty-val">
                      {item.quantity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="cart-drawer-footer">
          <div className="drawer-subtotal">
            <span className="drawer-subtotal__label">Subtotal</span>
            <span className="drawer-subtotal__value">
              ₹{subtotal.toFixed(2)}
            </span>
          </div>
          <p className="drawer-shipping-note">Free shipping · All India</p>
          <button
            className="drawer-view-cart"
            onClick={() => {
              onClose();
              navigate("/cart");
            }}
          >
            <span>View Cart</span>
            <span className="drawer-view-cart__arrow">→</span>
          </button>
        </div>
      </div>
    </>
  );
}
