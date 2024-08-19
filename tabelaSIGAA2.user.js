// ==UserScript==
// @name         tabelaSIGAA2
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Cria uma tabela no Sigaa com as matérias
// @author       Pedro Palhari
// @match        https://sigaa.ufrn.br/sigaa/portais/discente/discente.jsf
// @grant        none
// ==/UserScript==

/* tabelaSIGAA */
(function() {
    'use strict';

    // Criação da tabela e configuração inicial
    var table = document.createElement('table');
    var tableParent = document.getElementsByClassName('subFormulario');
    var superiorParent = tableParent[0].parentElement;

    // Inserindo a nova tabela na página, logo acima da tabela original
    superiorParent.insertBefore(table, tableParent[0].parentElement.children[2]);

    // Estilização da tabela
    table.style.border = '1px solid black';
    table.style.textAlign = 'center';
    table.style.fontSize = 'xx-small';
    table.style.marginTop = '20px';
    table.style.marginBottom = '20px';
    table.style.background = 'transparent';

    // Estrutura para armazenar o conteúdo da tabela (dias da semana e horários)
    let tableContents = {header:[], lefter:[], segunda:[], terca:[], quarta:[], quinta:[], sexta:[], sab:[]};

    // Lista de horários para a coluna da esquerda
    let horarios = ['07:00', '07:50', '08:50', '09:40', '10:40', '11:30', '13:00', '13:50', '14:50', '15:40', '16:40', '17:30', '18:40', '19:30', '20:30', '21:20'];

    // Montando a parte esquerda da tabela com os horários
    for (var i = 0; i < horarios.length; i++) {
        tableContents.lefter.push(table.insertRow(i));
        tableContents.lefter[i].insertCell(0).innerHTML = horarios[i];
        tableContents.lefter[i].style.border = '1px solid black';
        tableContents.lefter[i].style.background = 'rgb(177, 200, 243)';
    }

    // Criando o cabeçalho da tabela (dias da semana)
    let headerComponent = table.createTHead();
    let headerRow = headerComponent.insertRow(0);
    let diasDaSemana = ['', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    for (var i = 0; i < diasDaSemana.length; i++) {
        tableContents.header.push(headerRow.insertCell(i));
        tableContents.header[i].innerHTML = diasDaSemana[i];
        tableContents.header[i].style.border = '1px solid black';
        tableContents.header[i].style.background = 'rgb(177, 200, 243)';
    }

    // Criando as células para cada dia da semana
    for (var i = 0; i < horarios.length; i++) {
        tableContents.segunda.push(tableContents.lefter[i].insertCell(1));
        tableContents.terca.push(tableContents.lefter[i].insertCell(2));
        tableContents.quarta.push(tableContents.lefter[i].insertCell(3));
        tableContents.quinta.push(tableContents.lefter[i].insertCell(4));
        tableContents.sexta.push(tableContents.lefter[i].insertCell(5));
        tableContents.sab.push(tableContents.lefter[i].insertCell(6));

        // Estilização das células
        for (let dia of ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sab']) {
            tableContents[dia][i].style.border = '1px solid black';
            tableContents[dia][i].style.background = '#EFF3FA';
        }
    }

    // Seleciona a tabela que contém os horários das disciplinas
    var tabelaDeHorarios = document.getElementsByTagName('table')[62];

    // Captura as linhas da tabela que contêm os dados relevantes
    var linhasTabelaDeHorarios = [];
    for (var i = 1; i < tabelaDeHorarios.rows.length; i++) {
        if (tabelaDeHorarios.rows[i].children.length > 1 && tabelaDeHorarios.rows[i].children[2].innerText.trim() !== '') {
            linhasTabelaDeHorarios.push(tabelaDeHorarios.rows[i]);
        }
    }

    // Itera pelas linhas capturadas e extrai os horários, nomes das disciplinas e eventos onclick
    for (var i = 0; i < linhasTabelaDeHorarios.length; i++) {
        let horariosDisciplina = linhasTabelaDeHorarios[i].children[2].innerText.trim().split(" ");
        let nome = linhasTabelaDeHorarios[i].children[0].innerText.trim();
        let onclick = linhasTabelaDeHorarios[i].children[0].children[0].children[2]?.onclick;

        // Itera sobre cada código de horário para adicionar a disciplina na tabela no dia e horário corretos
        horariosDisciplina.forEach(horario => {
            addNoDia(horario, nome, onclick);
        });
    }

    // Função para adicionar a disciplina ao dia e horário corretos na tabela
    function addNoDia(grade, nomeDaMateria, onclick) {
        let splitGrade = grade.split('');
        let indexMTN;
        let horaDoDia;

        // Identifica o período do dia (M = Manhã, T = Tarde, N = Noite)
        if (splitGrade.indexOf('M') !== -1) {
            indexMTN = splitGrade.indexOf('M');
            horaDoDia = 'M';
        } else if (splitGrade.indexOf('T') !== -1) {
            indexMTN = splitGrade.indexOf('T');
            horaDoDia = 'T';
        } else if (splitGrade.indexOf('N') !== -1) {
            indexMTN = splitGrade.indexOf('N');
            horaDoDia = 'N';
        }

        // Dias da semana e horários são extraídos da string de horário
        let dias = grade.substring(0, indexMTN).split('');
        let horas = grade.substring(indexMTN + 1).split('');

        // Dicionário para mapear números de dias para os nomes de dias em tableContents
        let dic = ['', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sab'];
        for (var i = 0; i < dias.length; i++) {
            dias[i] = dic[parseInt(dias[i]) - 1];
        }

        // Ajuste dos horários baseado na parte do dia (manhã, tarde, noite)
        for (var i = 0; i < horas.length; i++) {
            horas[i] = parseInt(horas[i]);
            // Ajuste para tarde (13h para frente) e noite (18h40 para frente)
            if (horaDoDia === 'T') horas[i] += 6; // 13h é o início da tarde (hora 7 + 6 horas)
            if (horaDoDia === 'N') horas[i] += 12; // 18h40 é o início da noite (hora 7 + 12 horas)
        }

        // Preenchimento das células na tabela com os dados da disciplina
        for (var i = 0; i < dias.length; i++) {
            for (var j = 0; j < horas.length; j++) {
                let rowIndex = horas[j] - 1; // Convertendo para índice de linha
                if (rowIndex >= 0 && rowIndex < tableContents[dias[i]].length) {
                    tableContents[dias[i]][rowIndex].innerHTML = '<a href=\'#\'>' + nomeDaMateria + '</a>';
                    tableContents[dias[i]][rowIndex].onclick = onclick;
                    tableContents[dias[i]][rowIndex].style.background = '#E6ECF7';
                }
            }
        }
    }

    // Remover linhas vazias da tabela
    for (var i = 1; i < table.rows.length; i++) {
        let isPopulada = false;
        let thisRow = table.rows[i];
        for (var j = 1; j < 7; j++) {
            if (thisRow.children[j].innerText != "") isPopulada = true;
        }
        if (!isPopulada) {
            table.deleteRow(i);
            i--;
        }
    }




    /*horários SIGAA*/
    /** Cria dicionário para mapear os números e letras aos dias e horas reais */
const mapaDias = {
    2: 'SEG',
    3: 'TER',
    4: 'QUA',
    5: 'QUI',
    6: 'SEX',
    7: 'SAB'
}
const mapaHorarios = {
    'M1': {inicio: '07:00', fim: '07:50'},
    'M2': {inicio: '07:50', fim: '08:40'},
    'M3': {inicio: '08:50', fim: '09:40'},
    'M4': {inicio: '09:40', fim: '10:30'},
    'M5': {inicio: '10:40', fim: '11:30'},
    'M6': {inicio: '11:30', fim: '12:20'},
    'T1': {inicio: '13:00', fim: '13:50'},
    'T2': {inicio: '13:50', fim: '14:40'},
    'T3': {inicio: '14:50', fim: '15:40'},
    'T4': {inicio: '15:40', fim: '16:30'},
    'T5': {inicio: '16:40', fim: '17:30'},
    'T6': {inicio: '17:30', fim: '18:20'},
    'N1': {inicio: '18:40', fim: '19:30'},
    'N2': {inicio: '19:30', fim: '20:20'},
    'N3': {inicio: '20:30', fim: '21:20'},
    'N4': {inicio: '21:20', fim: '22:10'}
}

/** Padrão regex que reconhece o formato de horário do SIGAA */
const padraoSigaa = /\b([2-7]{1,5})([MTN])([1-7]{1,7})\b/gm;

/**
 * Função que recebe o horário do SIGAA e retorna o texto traduzido através do dicionário acima
 *
 * @param {*} match     O horário completo reconhecido pelo regex
 * @param {*} g1        O primeiro grupo de captura do regex - no caso, o dígito do dia da semana
 * @param {*} g2        O segundo grupo de captura do regex - no caso, a letra do turno
 * @param {*} g3        O terceiro grupo de captura do regex - no caso, o conjunto de dígitos dos horários
 */
function mapeiaHorarios(match, g1, g2, g3) {
    let dia         = mapaDias[g1];
    let hora_inicio = mapaHorarios[`${g2}${g3.charAt(0)}`].inicio;
    let hora_fim    = mapaHorarios[`${g2}${g3.charAt(g3.length-1)}`].fim;
    return `${dia} ${hora_inicio}-${hora_fim}`;
}

/**
 * Função que separa os dias para que toda "palavra" de horário tenha só 1 dígito de dia antes do turno.
 * ex: 246M12 vira 2M12 4M12 6M12.
 *
 * Quando já está devidamente separado, retorna o mesmo texto.
 *
 * @param {*} match     O horário completo reconhecido pelo regex
 * @param {*} g1        O primeiro grupo de captura do regex - no caso, o(s) dígito(s) do dia da semana
 * @param {*} g2        O segundo grupo de captura do regex - no caso, a letra do turno
 * @param {*} g3        O terceiro grupo de captura do regex - no caso, o conjunto de dígitos dos horários
 */
function separaDias(match, g1, g2, g3) {
    return [...g1].map(dia => `${dia}${g2}${g3}`).join(' ');
}

/**
 * Função que recebe o texto com os horários e o ordena pela ordem dos dias da semana
 * Ou seja, o primeiro dígito de cada "palavra".
 *
 * @param {*} texto     O texto HTML dos horários separados por espaço, que já foi tratado pela separaDias().
 * @returns   O texto com os horários ordenados separados por espaço.
 */
function ordenaDias(texto) {
    return [...texto.matchAll(padraoSigaa)]
        .sort((a,b) => a[1] < b[1] ? -1 :
                       a[1] > b[1] ? 1 : 0)
        .map(a => a[0])
        .join(' ');
}

/** Objeto TreeWalker que permite navegar por todos os campos de texto da página.
 * Neste, caso possui um filtro (3º argumento) que só permite textos (nós) que se encaixem no padrão SIGAA.
*/
const treeWalker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {acceptNode: (node) => padraoSigaa.test(node.textContent) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP},
    false
);

/** Procura por todos os textos e, onde reconhecer o padrão de horário, executa a substituição */
let node;
while(node = treeWalker.nextNode()){
    node.textContent = node.textContent.replace(padraoSigaa,separaDias);
    node.textContent = ordenaDias(node.textContent);
    node.textContent = node.textContent.replace(padraoSigaa,mapeiaHorarios);

    // por fim, junta as ocorrências 12:00-12:55/12:55-13:50 em simplesmente 12:00-13:50
    node.textContent = node.textContent.replace(/([A-Z]{3}) 12:00-12:55 ([A-Z]{3}) 12:55-13:50/gm, '$1 12:00-13:50')
}

let url = window.location.href;

/** Na página de oferta de turmas existem caixas de ajuda com o horário consertado ao lado do texto de cada horário,
 que se tornam redundantes quando esse script é executado, portanto serão desabilitadas */
if (url.includes("public/turmas/listar.jsf")) {
    Array.from(document.querySelectorAll("img[src='/shared/img/geral/ajuda.gif']"))
    .forEach((icon) => icon.hidden = true);
}

/** Procedimento para alterar o tamanho da coluna dos horários, dependendo de qual página foi aberta */
Array.from(document.querySelectorAll("tHead th"))              // seleciona todos os cabeçalhos de tabelas na página
.filter((col) => col.innerText.includes("Horário"))   // seleciona só as colunas cujo texto é "Horário" (geralmente será só 1)
.forEach((col) =>
    col.width = url.includes("graduacao/matricula/turmas_curriculo.jsf")              ? "35%" :
                url.includes("graduacao/matricula/turmas_equivalentes_curriculo.jsf") ? "13%" :
                url.includes("graduacao/matricula/turmas_extra_curriculo.jsf")        ? "12%" :
                url.includes("portais/discente/discente.jsf")                         ? "18%" :
                url.includes("portais/discente/turmas.jsf")                           ? "34%" :
                url.includes("public/turmas/listar.jsf")                              ? "13%" :
                col.width
);
})();

