import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Auth0Provider } from '@auth0/auth0-react'


createRoot(document.getElementById('root')).render(
  <Auth0Provider
      domain="dev-a3l68wtd82inod7x.us.auth0.com"
      clientId="SvHLrX1a3GBKVCfryDxR0CJ662Td1YWJ"
      authorizationParams={{
        audience: "https://af-api",
        redirect_uri: window.location.origin
      }}
    >
    <App />
  </Auth0Provider>,
)