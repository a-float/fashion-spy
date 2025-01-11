type User = {
  email: string;
};

type AppProps = {
  user: User | null;
};

interface Window {
  __INITIAL_DATA__: AppProps;
}
