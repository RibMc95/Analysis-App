type InvalidTickerModalProps = {
    isOpen: boolean
    message: string
    onClose: () => void
}

export function InvalidTickerModal({ isOpen, message, onClose }: InvalidTickerModalProps) {
    if (!isOpen) {
        return null
    }

    return (
        <div className="modal-overlay" role="presentation" onClick={onClose}>
            <section
                className="modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="invalid-ticker-title"
                onClick={(event) => event.stopPropagation()}
            >
                <h2 id="invalid-ticker-title">Invalid ticker</h2>
                <p>{message}</p>
                <button type="button" onClick={onClose}>
                    Try again
                </button>
            </section>
        </div>
    )
}
