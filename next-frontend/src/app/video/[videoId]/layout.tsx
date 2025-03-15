// export const metadata = {
//     title: "My Custom Video Page",
// };

export default function VideoLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    return <section>{children}</section>
  }