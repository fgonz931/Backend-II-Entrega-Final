function showCart() {
  const cartId = localStorage.getItem("cartId");

  if (!cartId) {
    Toastify({
      text: "Carrito vacío",
      duration: 3000,
    }).showToast();

    return;
  }

  window.location.href = "/carts/" + cartId;
}

async function addToCart(productId) {
  let cartId = localStorage.getItem("cartId");

  if (!cartId) {
    const res = await fetch("/api/carts", {
      method: "POST",
    });

    const data = await res.json();

    cartId = data.payload._id;

    localStorage.setItem("cartId", cartId);
  }

  await fetch(`/api/carts/${cartId}/products/${productId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  Toastify({
    text: "Producto agregado al carrito",
    duration: 3000,
  }).showToast();
}

async function removeFromCart(productId) {
  const cartId = localStorage.getItem("cartId");

  const response = await fetch(`/api/carts/${cartId}/products/${productId}`, {
    method: "DELETE",
  });

  if (response.ok) {
    Toastify({
      text: "Producto eliminado del carrito",
      duration: 2000,
      gravity: "top",
      position: "right",
      style: {
        background: "#ff4d4d",
      },
    }).showToast();

    setTimeout(() => {
      location.reload();
    }, 1500);
  } else {
    Toastify({
      text: "Error al eliminar el producto",
      duration: 3000,
      gravity: "top",
      position: "right",
      style: {
        background: "#e74c3c",
      },
    }).showToast();
  }
}

async function clearCart() {
  const cartId = localStorage.getItem("cartId");

  const confirmClear = confirm("¿Seguro que querés vaciar el carrito?");

  if (!confirmClear) return;

  await fetch(`/api/carts/${cartId}`, {
    method: "DELETE",
  });

  Toastify({
    text: "Carrito vaciado",
    duration: 3000,
    gravity: "top",
    position: "right",
  }).showToast();

  setTimeout(() => {
    location.reload();
  }, 1000);
}
