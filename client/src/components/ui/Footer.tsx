const SERIF = "'Libre Baskerville', Georgia, serif"

export default function Footer() {
    return (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100, display: 'flex', justifyContent: 'center', padding: '14px 0 16px', pointerEvents: 'none' }}>
            <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 11, color: 'rgba(237,232,223,0.12)', margin: 0, letterSpacing: '0.15em' }}>
                designed and developed by <span style={{ color: 'rgba(200,160,90,0.3)' }}>Mohini</span>
            </p>
        </div>
    )
}
