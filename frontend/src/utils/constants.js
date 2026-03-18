export const DIAS_SEMANA = [
  { valor: 0, nome: "Domingo", abreviacao: "Dom" },
  { valor: 1, nome: "Segunda-feira", abreviacao: "Seg" },
  { valor: 2, nome: "Terça-feira", abreviacao: "Ter" },
  { valor: 3, nome: "Quarta-feira", abreviacao: "Qua" },
  { valor: 4, nome: "Quinta-feira", abreviacao: "Qui" },
  { valor: 5, nome: "Sexta-feira", abreviacao: "Sex" },
  { valor: 6, nome: "Sábado", abreviacao: "Sáb" },
];

export const DIAS_SEMANA_ABREVIADOS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

/** Dias da semana para regras de agenda (Seg-Sáb-Dom, ordem de exibição). */
export const DIAS_SEMANA_REGRAS = [
  ...DIAS_SEMANA.filter((d) => d.valor >= 1),
  ...DIAS_SEMANA.filter((d) => d.valor === 0),
];

export const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export const TOKEN_KEY = "vaiterplay_token";
export const USER_KEY = "vaiterplay_usuario";
