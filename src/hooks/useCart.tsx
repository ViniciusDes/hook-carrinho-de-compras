import { createContext, ReactNode, useContext, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../services/api";
import { Product } from "../types";

interface CartProviderProps {
  children: ReactNode;
}

type ProductDetailInfo = {
  id: number;
  amount: number;
};

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem("@RocketShoes:cart");
    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const productAdded = cart.find((product) => product.id === productId);

      const productDetail = await getProductInfoDetails(productId);

      let amount = 0;
      if (productAdded) {
        amount = productAdded.amount + 1;

        if (amount > productDetail.amount) {
          toast.error("Quantidade solicitada fora de estoque");
          return;
        }

        productAdded.amount = amount;
        const newCart = [
          ...cart.filter((product) => product.id !== productId),
          { ...productAdded },
        ];
        setCart(newCart);
        localStorage.setItem("@RocketShoes:cart", JSON.stringify(newCart));
      } else {
        if (amount > productDetail.amount) {
          toast.error("Quantidade solicitada fora de estoque");
        }

        const { data } = await api.get(`/products/${productId}`);
        const newCart = [...cart, { ...data, amount: 1 }];

        setCart(newCart);
        localStorage.setItem("@RocketShoes:cart", JSON.stringify(newCart));
      }
    } catch (err) {
      toast.error("Erro na adição do produto");
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const productToRemove = cart.find((product) => product.id === productId);
      if (productToRemove) {
        const newCart = cart.filter((product) => product !== productToRemove);
        localStorage.setItem("@RocketShoes:cart", JSON.stringify(newCart));
        setCart(newCart);
      } else {
        toast.error("Erro na remoção do produto");
        return;
      }
    } catch {
      toast.error("Erro na remoção do produto");
      return;
    }
  };

  const getProductInfoDetails = async (
    productId: number
  ): Promise<ProductDetailInfo> => {
    const { data } = await api.get(`/stock/${productId}`);
    return data;
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      const productToEditAmount = cart.find(
        (product) => product.id === productId
      );
      const productDetail = await getProductInfoDetails(productId);
      if (amount <= 0) {
        toast.error("Erro na alteração de quantidade do produto");
        return;
      }

      if (amount > productDetail.amount) {
        toast.error("Quantidade solicitada fora de estoque");
        return;
      }

      if (productToEditAmount) {
        productToEditAmount.amount = amount;
        const newCart = [
          ...cart.filter((product) => product.id !== productId),
          productToEditAmount,
        ];
        setCart(newCart);
        localStorage.setItem("@RocketShoes:cart", JSON.stringify(newCart));
      }
    } catch {
      toast.error("Erro na alteração de quantidade do produto");
      return;
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
