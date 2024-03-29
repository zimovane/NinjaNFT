import { ChangeEvent, useState } from "react";
import { useRouter } from "next/router";
import { uploadNFT } from "../../utils/nftstorage";
import { useAptosWallet } from "../../hooks/useAptos";

export default function Mint() {
  const router = useRouter();
  const address = useAptosWallet();
  const [base64image, setBase64image] = useState("");
  const [formInput, updateFormInput] = useState<{
    name: string;
    description: string;
    file: File | null;
  }>({
    name: "",
    description: "",
    file: null,
  });

  async function onChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files![0];
    updateFormInput({ ...formInput, file: file });
    const reader = new FileReader();
    reader.onload = function (event) {
      setBase64image(event.target!.result!.toString());
    };
    reader.readAsDataURL(file);
  }

  async function mintNFT() {
    const { name, description, file } = formInput;
    if (!address || !name || !description || !file) return;
    try {
      const token = await uploadNFT(file, name, description);
      const collname = "collName" + new Date().getMilliseconds();
      await (window as any).martian.createCollection(
        collname,
        "Demo NFT Collection",
        "https://aptos.dev"
      );
      await (window as any).martian.createToken(
        collname,
        name,
        description,
        1,
        token.url
      );
      router.push("/aptos-market/dashboard");
    } catch (error) {
      console.log("Error create NFT: ", error);
    }
  }

  return (
    <div className="flex justify-center">
      <div className="w-1/2 flex flex-col pb-12">
        <input
          placeholder="Asset Name"
          className="mt-8 p-4 input input-bordered input-primary w-full"
          onChange={(e) =>
            updateFormInput({ ...formInput, name: e.target.value })
          }
        />
        <textarea
          placeholder="Asset Description"
          className="mt-2 p-4 textarea textarea-primary input-lg w-full"
          onChange={(e) =>
            updateFormInput({ ...formInput, description: e.target.value })
          }
        />
        <input type="file" name="Asset" className="my-4" onChange={onChange} />
        {base64image && (
          <img className="rounded mt-4" width="350" src={base64image} />
        )}
        <button
          onClick={mintNFT}
          className="btn btn-primary font-bold mt-4  text-white rounded p-4 shadow-lg"
        >
          Mint NFT
        </button>
      </div>
    </div>
  );
}
