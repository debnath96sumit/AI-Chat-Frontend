// App.js or index.js
import Chat from './Chat'; // Your main component
import { RedirectToSignIn, SignedIn, SignedOut } from '@clerk/clerk-react';
function App() {
  return (
    <div className="App">
      <SignedIn>
        <Chat />
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </div>
  );
}

export default App;