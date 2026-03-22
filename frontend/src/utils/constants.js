export const DIAS_SEMANA = [
  { valor: 0, nome: "Domingo", abreviacao: "Dom", nome_curto: "Domingo" },
  { valor: 1, nome: "Segunda-feira", abreviacao: "Seg", nome_curto: "Segunda" },
  { valor: 2, nome: "Terça-feira", abreviacao: "Ter", nome_curto: "Terça" },
  { valor: 3, nome: "Quarta-feira", abreviacao: "Qua", nome_curto: "Quarta" },
  { valor: 4, nome: "Quinta-feira", abreviacao: "Qui", nome_curto: "Quinta" },
  { valor: 5, nome: "Sexta-feira", abreviacao: "Sex", nome_curto: "Sexta" },
  { valor: 6, nome: "Sábado", abreviacao: "Sáb", nome_curto: "Sábado" },
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

export const ESTADOS_BR = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS",
  "MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"
];

export const ESTADOS_NOME = {
  AC:"Acre",AL:"Alagoas",AP:"Amapá",AM:"Amazonas",BA:"Bahia",CE:"Ceará",
  DF:"Distrito Federal",ES:"Espírito Santo",GO:"Goiás",MA:"Maranhão",
  MT:"Mato Grosso",MS:"Mato Grosso do Sul",MG:"Minas Gerais",PA:"Pará",
  PB:"Paraíba",PR:"Paraná",PE:"Pernambuco",PI:"Piauí",RJ:"Rio de Janeiro",
  RN:"Rio Grande do Norte",RS:"Rio Grande do Sul",RO:"Rondônia",RR:"Roraima",
  SC:"Santa Catarina",SP:"São Paulo",SE:"Sergipe",TO:"Tocantins"
};

export const ESTRUTURAS_QUADRA = ["Indoor", "Coberta", "Externa"];
export const MATERIAIS_QUADRA = ["Sintético", "Gramado Natural", "Cimento", "Madeira", "Areia", "Saibro"];

export const PERIODOS_RELATORIO = [
  { key: "hoje", label: "Hoje" },
  { key: "semana", label: "Esta Semana" },
  { key: "mes", label: "Este Mês" },
  { key: "custom", label: "Personalizado" },
];
