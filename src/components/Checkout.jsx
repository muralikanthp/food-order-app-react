import { useContext, useActionState } from "react";

import Modal from "./UI/Modal";
import Input from "./UI/Input";
import Button from "./UI/Button";
import Error from "./Error.jsx";
import useHttp from "../hooks/useHTTP.js";
import CartContext from "../store/CartContext";
import UserProgressContext from "../store/UserProgressContext.jsx";
import { currencyFormatter } from "../util/formatting";

const requestConfig = {
  method: "POST",
  headers: { "Content-Type": "application/json" },
};

export default function Checkout() {
  const userProgressCtx = useContext(UserProgressContext);
  const cartCtx = useContext(CartContext);

  const cartTotal = cartCtx.items.reduce(
    (totalPrice, item) => totalPrice + item.quantity * item.price,
    0
  );

  const {
    isLoading: isSending,
    data,
    error,
    sendRequest,
    clearData,
  } = useHttp("http://localhost:3000/orders", requestConfig);

  function handleClose() {
    userProgressCtx.hideCheckout();
  }

  async function checkoutAction(prevState, fd) {
    const customerData = Object.fromEntries(fd.entries());

    await sendRequest(
      JSON.stringify({
        order: { items: cartCtx.items, customer: customerData },
      })
    );
  }
  const [formState, formAction, pending] = useActionState(checkoutAction, null);

  function handleFinish() {
    userProgressCtx.hideCheckout();
    cartCtx.clearCart();
    clearData();
  }

  let actions = (
    <>
      <Button textOnly type="button" onClick={handleClose}>
        Close
      </Button>
      <Button>Place Order</Button>
    </>
  );

  if (pending) {
    actions = <span>Placing Order...</span>;
  }

  if (data && !error) {
    return (
      <Modal
        open={userProgressCtx.progress === "checkout"}
        onClose={handleFinish}
      >
        <h2>Success!</h2>
        <p>Your Order Placed Successfully.</p>
        <p>
          We will get back to you with more details via email in the next few
          minutes.
        </p>
        <p className="modal-actions">
          <Button onClick={handleFinish}>Okay</Button>
        </p>
      </Modal>
    );
  }

  return (
    <Modal open={userProgressCtx.progress === "checkout"} onClose={handleClose}>
      <form action={formAction}>
        <h2>Checkout</h2>
        <p>Total Amount: {currencyFormatter.format(cartTotal)}</p>

        <Input id="name" label="Name" type="text" />
        <Input id="email" label="E-Mail ID" type="email" />
        <Input id="street" label="Street" type="text" />
        <div className="control-row">
          <Input id="city" label="City" type="text" />
          <Input id="postal-code" label="Postal Code" type="text" />
        </div>

        {error && <Error title="Failed to place order" message={error} />}

        <p className="modal-actions">{actions}</p>
      </form>
    </Modal>
  );
}
