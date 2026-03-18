import { useEffect, useRef } from "react"

const FOCUSAVEIS = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ")

/**
 * Trap de foco para modais e diálogos.
 *
 * Comportamento:
 * - Quando `aberto` vira true: salva o elemento com foco atual,
 *   move o foco para o primeiro elemento focável do container,
 *   intercepta Tab/Shift+Tab para ciclar apenas dentro do container,
 *   e fecha o modal ao pressionar Escape.
 * - Quando `aberto` vira false: restaura o foco para o elemento que
 *   estava ativo antes da abertura do modal.
 *
 * @param {boolean} aberto - Estado de visibilidade do modal
 * @param {function} onFechar - Callback chamado ao pressionar Escape
 * @returns {React.RefObject} ref - Attach no elemento container do modal
 */
const useFocusTrap = (aberto, onFechar) => {
  const containerRef = useRef(null)
  const anteriorFocoRef = useRef(null)
  const onFecharRef = useRef(onFechar)

  // Mantém referência estável para não re-executar o effect ao recriar arrow functions
  useEffect(() => {
    onFecharRef.current = onFechar
  }, [onFechar])

  useEffect(() => {
    if (!aberto) return

    anteriorFocoRef.current = document.activeElement

    const container = containerRef.current
    if (!container) return

    const obterFocusaveis = () =>
      Array.from(container.querySelectorAll(FOCUSAVEIS)).filter(
        (el) => !el.closest("[hidden]") && !el.closest("[aria-hidden='true']")
      )

    const elementos = obterFocusaveis()
    if (elementos.length > 0) {
      elementos[0].focus()
    } else {
      container.focus()
    }

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        // stopPropagation impede que modais aninhados fechem em cascata
        e.stopPropagation()
        onFecharRef.current()
        return
      }

      if (e.key !== "Tab") return

      const focusaveis = obterFocusaveis()
      if (focusaveis.length === 0) return

      const primeiro = focusaveis[0]
      const ultimo = focusaveis[focusaveis.length - 1]
      const ativo = document.activeElement

      if (e.shiftKey) {
        if (ativo === primeiro || !container.contains(ativo)) {
          e.preventDefault()
          ultimo.focus()
        }
      } else {
        if (ativo === ultimo || !container.contains(ativo)) {
          e.preventDefault()
          primeiro.focus()
        }
      }
    }

    // Listener no container (não no document) para isolar modais aninhados
    container.addEventListener("keydown", handleKeyDown)

    return () => {
      container.removeEventListener("keydown", handleKeyDown)
      const anterior = anteriorFocoRef.current
      if (anterior && document.contains(anterior)) {
        anterior.focus()
      }
    }
  }, [aberto])

  return containerRef
}

export default useFocusTrap
