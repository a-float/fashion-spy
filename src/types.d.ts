type User = {
  username: string;
  isAdmin: boolean;
};

type AppProps = {
  user: User | null;
  location: string;
};

interface Window {
  __INITIAL_DATA__: AppProps;
}
