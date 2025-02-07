import React, { FC } from "react";

export interface PricesProps {
  className?: string;
  price?: number;
  contentClass?: string;
  discountRate?: number;
  discountedPrice?: number;
}

/**
 * 가격 표시
 * @param price 상품 가격
 * @returns
 */
const Prices: FC<PricesProps> = ({
  className = "",
  price,
  discountRate,
  discountedPrice,
  contentClass = "py-1 px-2 md:py-1.5 md:px-2.5 text-sm font-medium",
}) => {
  const formattedDiscountedPrice = discountedPrice?.toLocaleString("ko-KR", {
    style: "currency",
    currency: "KRW",
  });
  const formattedPrice = price?.toLocaleString("ko-KR", {
    style: "currency",
    currency: "KRW",
  });
  return (
    <div className={`${className} flex-col flex items-end lg:items-start`}>
      {discountRate && (
        <>
          <div className={`items-center rounded-lg ${contentClass}`}>
            <span className="font-semibold text-blue-500 !leading-none">
              {discountRate}%
            </span>
          </div>
          <div className={`items-center rounded-lg ${contentClass}`}>
            <span className="line-through font-semibold text-gray-400 !leading-none">
              {formattedPrice}
            </span>
          </div>
        </>
      )}
      {
        discountRate ?
          <div className={`items-center rounded-lg ${contentClass}`}>
            <span className="font-bold text-red-600 text-lg lg:text-2xl !leading-none">
              {formattedDiscountedPrice}
            </span>
          </div>
          :
          <div className={`items-center rounded-lg ${contentClass}`}>
            <span className="font-bold text-black text-lg lg:text-2xl !leading-none dark:text-white">
              {formattedPrice}
            </span>
          </div>
      }
    </div>
  );
};

export default Prices;
