import { useEffect, useState } from 'react';
import QueryWorkspace from './components/QueryWorkspace';
import { ConnectionForm } from './components/ConnectionForm'; // Changed to named import

const App = () => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const checkConnection = () => {
      const pgConnectionString = localStorage.getItem('pgConnectionString');
      setIsConnected(!!pgConnectionString);
    };
    window.addEventListener('storage', checkConnection);
    checkConnection();

    return () => {
      window.removeEventListener('storage', checkConnection);
    };
  }, []);

  return (
    <div className="flex h-screen flex-col">
      {isConnected ? <QueryWorkspace /> : <ConnectionForm onConnect={() => setIsConnected(true)} />}
    </div>
  );
};

export default App;