// Ponto de entrada: liga o Auth0 e desenha o App. Normalmente não precisa mexer
// (os valores do Auth0 ficam em config.js).
import { createRoot } from 'react-dom/client'
import { Auth0Provider } from '@auth0/auth0-react'
import { AUTH0_AUDIENCE, AUTH0_CLIENT_ID, AUTH0_DOMAIN } from './config'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <Auth0Provider
    domain={AUTH0_DOMAIN}
    clientId={AUTH0_CLIENT_ID}
    authorizationParams={{
      audience: AUTH0_AUDIENCE,
      redirect_uri: window.location.origin,
    }}
  >
    <App />
  </Auth0Provider>,
)
