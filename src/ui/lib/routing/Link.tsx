import { useRouter } from "./RouterProvider";

type LinkProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  to: string;
};

export function Link({ to, ...rest }: LinkProps) {
  const { router } = useRouter();
  return (
    <a
      {...rest}
      href={to}
      onClick={(e) => {
        e.preventDefault();
        router.navigate(to);
      }}
    />
  );
}
