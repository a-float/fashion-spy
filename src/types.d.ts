type User = {
  username: string;
};

type AppProps = {
  user: User | null;
  location: string;
  styleLinks: string[];
};

interface Window {
  __INITIAL_DATA__: AppProps;
}
