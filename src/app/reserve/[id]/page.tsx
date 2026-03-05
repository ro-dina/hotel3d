import { HOTELS } from "@/app/data/mockHotels";
import ReserveClient from "./ReserveClient";

export const dynamic = "force-dynamic";

// Next.js 15以降: params と searchParams は Promise 型になります
type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ReservePage(props: PageProps) {
  // ★ ここで await して中身を取り出します
  const params = await props.params;
  const searchParams = await props.searchParams;

  const { id } = params;
  const hotel = HOTELS.find((h) => String(h.id) === id);

  if (!hotel) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f4f0] text-[#111]">
        <div className="text-center">
          <h1 className="text-2xl font-black">ERROR: OBJECT NOT FOUND</h1>
          <p className="mt-2">指定されたIDの空間データにアクセスできません。</p>
        </div>
      </div>
    );
  }

  return (
    <ReserveClient 
      id={id} 
      hotel={hotel} 
      // searchParamsがない場合も考慮して空オブジェクトを渡す
      searchParams={searchParams ?? {}} 
    />
  );
}
