import WalletButton from './WalletButton'

export default function Layout({ children }) {
  return (
    <>
      <header style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>
        <h1>KingDAO</h1>
        <WalletButton />
      </header>
      <main style={{ padding: '1rem' }}>
        {children}
      </main>
      <footer style={{ padding: '1rem', borderTop: '1px solid #eee', textAlign: 'center' }}>
        © {new Date().getFullYear()} KingDAO
      </footer>
    </>
  )
}
