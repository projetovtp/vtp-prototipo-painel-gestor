// src/pages/components/agenda/AgendaGrid.jsx
import React, { useMemo } from "react";

/**
 * Grade estilo "cinema":
 * - Colunas = dias
 * - Linhas = horários
 *
 * Espera a prop `dias` no formato:
 *
 * dias = [
 *   {
 *     id: "2025-12-10",
 *     label: "Qua 10/12",
 *     slots: [
 *       { hora: "18:00", status: "disponivel", descricao: "Livre" },
 *       { hora: "19:00", status: "reservada", descricao: "Fulano" },
 *       ...
 *     ],
 *   },
 *   ...
 * ];
 */
export function AgendaGrid({ dias }) {
  // Horas únicas, ordenadas
  const horas = useMemo(() => {
    const set = new Set();
    (dias || []).forEach((dia) => {
      (dia.slots || []).forEach((slot) => {
        if (slot.hora) set.add(slot.hora);
      });
    });

    return Array.from(set).sort();
  }, [dias]);

  if (!dias || dias.length === 0) {
    return (
      <p style={{ marginTop: 8, fontSize: 13, color: "#666" }}>
        Nenhum dia para exibir na agenda ainda.
      </p>
    );
  }

  if (horas.length === 0) {
    return (
      <p style={{ marginTop: 8, fontSize: 13, color: "#666" }}>
        Nenhum horário cadastrado nos dias selecionados.
      </p>
    );
  }

  return (
    <div
      className="agenda-grid"
      style={{ overflowX: "auto", borderRadius: 8, border: "1px solid #eee" }}
    >
      <table
        style={{
          borderCollapse: "collapse",
          width: "100%",
          minWidth: 700,
          fontSize: 13,
        }}
      >
        <thead>
          <tr>
            {/* Coluna fixa de horários */}
            <th
              style={{
                position: "sticky",
                left: 0,
                background: "#fafafa",
                zIndex: 2,
                padding: "8px 12px",
                borderBottom: "1px solid #e5e5e5",
                textAlign: "left",
              }}
            >
              Horário
            </th>

            {dias.map((dia) => (
              <th
                key={dia.id}
                style={{
                  padding: "8px 12px",
                  borderBottom: "1px solid #e5e5e5",
                  textAlign: "center",
                  whiteSpace: "nowrap",
                }}
              >
                {dia.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {horas.map((hora) => (
            <tr key={hora}>
              {/* Coluna fixa com a hora */}
              <td
                style={{
                  position: "sticky",
                  left: 0,
                  background: "#fafafa",
                  zIndex: 1,
                  padding: "6px 12px",
                  borderBottom: "1px solid #f1f1f1",
                  fontWeight: 500,
                }}
              >
                {hora}
              </td>

              {dias.map((dia) => {
                const slot =
                  (dia.slots || []).find((s) => s.hora === hora) || null;

                const status = slot?.status || "vazio";
                const descricao = slot?.descricao || "";

                let classStatus = "";
                if (status === "disponivel") classStatus = "slot-disponivel";
                else if (status === "reservada") classStatus = "slot-reservada";
                else if (status === "bloqueada") classStatus = "slot-bloqueada";

                return (
                  <td
                    key={dia.id + hora}
                    className={classStatus}
                    style={{
                      padding: "6px 8px",
                      borderBottom: "1px solid #f1f1f1",
                      borderLeft: "1px solid #f9f9f9",
                      textAlign: "center",
                      cursor: "default",
                    }}
                    title={descricao}
                  >
                    {/* Conteúdo interno do “quadradinho” */}
                    <div
                      style={{
                        minHeight: 32,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "2px 4px",
                        borderRadius: 6,
                      }}
                    >
                      {status === "disponivel" && "Livre"}
                      {status === "reservada" && "Reservada"}
                      {status === "bloqueada" && "Bloqueada"}
                      {status === "vazio" && "-"}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
