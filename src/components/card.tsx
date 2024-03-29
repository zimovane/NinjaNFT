import { CardType } from "../interfaces";
import Image from "next/image";

type CardProps = { key: string; data: any; onClick: any; type: CardType };

export function Card({ key, data, onClick, type }: CardProps) {
  return (
    <div key={key} className="card card-compact bg-base-100 shadow-xl">
      <Image
        className="bg-neutral-200"
        src={data.image}
        height={500}
        width={500}
        objectFit="cover"
        alt="picture"
      />
      <div className="card-body">
        <h2 className="card-title">{data.name}</h2>
        <p>{data.description}</p>
        {type != "noraml" || (
          <div className="justify-start text-pink-400 font-bold">
            {data.price} ETH
          </div>
        )}
        {type != "noraml" && (
          <div className="card-actions justify-end">
            <button
              className="btn btn-primary"
              onClick={onClick}
              style={{ minWidth: "6rem" }}
            >
              {type == "withBuyBtn" ? "Buy Now" : "List"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
