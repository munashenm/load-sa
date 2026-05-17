import Link from "next/link";

export default async function PayCancelPage({
  searchParams,
}: {
  searchParams: Promise<{ booking?: string }>;
}) {
  const { booking } = await searchParams;

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <h1 className="text-xl font-bold text-white">Payment cancelled</h1>
      <p className="mt-2 text-slate-400">No charge was made.</p>
      <Link
        href={booking ? `/book` : "/book"}
        className="mt-6 inline-block text-amber-400 hover:underline"
      >
        Back to bookings
      </Link>
    </div>
  );
}
