export function flyToCart(imgElement, cartElement) {
  if (!imgElement || !cartElement) return;

  const imgRect = imgElement.getBoundingClientRect();
  const cartRect = cartElement.getBoundingClientRect();

  const clone = imgElement.cloneNode(true);
  clone.style.position = "fixed";
  clone.style.left = imgRect.left + "px";
  clone.style.top = imgRect.top + "px";
  clone.style.width = imgRect.width + "px";
  clone.style.height = imgRect.height + "px";
  clone.style.zIndex = "99999";
  clone.style.transition = "all .65s cubic-bezier(.22,1,.36,1)";
  clone.style.pointerEvents = "none";

  document.body.appendChild(clone);

  requestAnimationFrame(() => {
    clone.style.left = cartRect.left + "px";
    clone.style.top = cartRect.top + "px";
    clone.style.width = "20px";
    clone.style.height = "20px";
    clone.style.opacity = "0.2";
  });

  setTimeout(() => {
    clone.remove();
  }, 650);
}
