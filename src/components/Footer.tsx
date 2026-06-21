const version = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev'

export default function Footer() {
  return (
    <footer className="text-center py-3 text-white/40 text-xs cantonese-text">
      v{version}
    </footer>
  )
}
