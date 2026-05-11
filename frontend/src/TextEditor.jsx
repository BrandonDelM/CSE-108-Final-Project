import { useRef } from 'react'

const COLORS = ['#000000', '#ffffff', '#e8a030', '#d9616b', '#6eb89a', '#5b7fe8', '#888888']

function ToolbarButton({ onClick, title, children }) {
    return (
        <button
            onMouseDown={e => { e.preventDefault(); onClick() }}
            title={title}
            style={{
                background: 'transparent',
                border: 'none',
                borderRadius: '4px',
                color: 'var(--text)',
                cursor: 'pointer',
                padding: '4px 8px',
                fontSize: '13px',
            }}
        >
            {children}
        </button>
    )
}

function ColorPicker({ label, onChange, showRemove }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-3)' }}>{label}</span>
            {showRemove && (
                <button
                    onMouseDown={e => { e.preventDefault(); onChange('remove') }}
                    title="Remove highlight"
                    style={{
                        width: '16px', height: '16px',
                        borderRadius: '50%',
                        background: 'transparent',
                        border: '1px solid var(--border-2)',
                        cursor: 'pointer',
                        padding: 0,
                        fontSize: '10px',
                        color: 'var(--text-3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                    }}
                >✕</button>
            )}
            {COLORS.map(color => (
                <button
                    key={color}
                    onMouseDown={e => { e.preventDefault(); onChange(color) }}
                    style={{
                        width: '16px', height: '16px',
                        borderRadius: '50%',
                        background: color,
                        border: '1px solid var(--border-2)',
                        cursor: 'pointer',
                        padding: 0,
                        flexShrink: 0,
                    }}
                />
            ))}
        </div>
    )
}

export default function TextEditor({ onChange }) {
    const editorRef = useRef()

    function exec(command, value = null) {
        editorRef.current.focus()
        document.execCommand(command, false, value)
        onChange(editorRef.current.innerHTML)
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                alignItems: 'center',
                background: 'var(--ink-3)',
                border: '1px solid var(--border-2)',
                borderRadius: '6px',
                padding: '6px 10px',
            }}>
                <ToolbarButton onClick={() => exec('bold')} title="Bold"><b>B</b></ToolbarButton>
                <ToolbarButton onClick={() => exec('italic')} title="Italic"><i>I</i></ToolbarButton>
                <ToolbarButton onClick={() => exec('underline')} title="Underline"><u>U</u></ToolbarButton>

                <div style={{ width: '1px', height: '20px', background: 'var(--border-2)' }} />

                <ColorPicker label="Text" onChange={color => exec('foreColor', color)} />

                <div style={{ width: '1px', height: '20px', background: 'var(--border-2)' }} />

                <ColorPicker label="Highlight" onChange={color => exec('hiliteColor', color === 'remove' ? 'transparent' : color)} showRemove />
            </div>

            <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={() => onChange(editorRef.current.innerHTML)}
                style={{
                    background: 'var(--ink-2)',
                    border: '1px solid var(--border-2)',
                    borderRadius: '6px',
                    padding: '11px 14px',
                    color: 'var(--text)',
                    minHeight: '100px',
                    fontSize: '15px',
                    lineHeight: '1.6',
                    outline: 'none',
                    cursor: 'text',
                }}
            />
        </div>
    )
}