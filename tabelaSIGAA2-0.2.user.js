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

    // Verifique se o índice da tabela está correto
    var tabelaDeHorarios = document.querySelector("#turmas-portal > table:nth-child(4)"); // Verifique o índice correto

    if (!tabelaDeHorarios) {
        console.error('Tabela de horários não encontrada.');
        return;
    }

    // Captura as linhas da tabela que contêm os dados relevantes
    var linhasTabelaDeHorarios = [];
    for (var i = 1; i < tabelaDeHorarios.rows.length; i++) {
        if (tabelaDeHorarios.rows[i].children.length > 2 && tabelaDeHorarios.rows[i].children[2].innerText.trim() !== '') {
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

    // Se indexMTN não for definido, significa que não encontramos M, T ou N
    if (indexMTN === undefined) {
        console.error('Período do dia não encontrado para o horário:', grade);
        return;
    }

    // Dias da semana e horários são extraídos da string de horário
    let dias = grade.substring(0, indexMTN).split('');
    let horas = grade.substring(indexMTN + 1).split('');

    // Dicionário para mapear números de dias para os nomes de dias em tableContents
    let dic = {
        '2': 'segunda',
        '3': 'terca',
        '4': 'quarta',
        '5': 'quinta',
        '6': 'sexta',
        '7': 'sab'
    };

    for (let i = 0; i < dias.length; i++) {
        let diaIndex = dias[i];
        if (dic[diaIndex]) {
            dias[i] = dic[diaIndex];
        } else {
            console.error('Dia inválido encontrado:', diaIndex);
            return;
        }
    }

    // Ajuste dos horários baseado na parte do dia (manhã, tarde, noite)
    for (let i = 0; i < horas.length; i++) {
        horas[i] = parseInt(horas[i]);
        if (isNaN(horas[i])) {
            console.error('Hora inválida encontrada:', horas[i]);
            return;
        }
        // Ajuste para tarde (13h para frente) e noite (18h40 para frente)
        if (horaDoDia === 'T') horas[i] += 6; // 13h é o início da tarde (hora 7 + 6 horas)
        if (horaDoDia === 'N') horas[i] += 12; // 18h40 é o início da noite (hora 7 + 12 horas)
    }

    // Preenchimento das células na tabela com os dados da disciplina
    for (let i = 0; i < dias.length; i++) {
        for (let j = 0; j < horas.length; j++) {
            let rowIndex = horas[j] - 1; // Convertendo para índice de linha

            // Verifique se tableContents[dias[i]] está definido e tem a propriedade length
            if (tableContents[dias[i]] && tableContents[dias[i]].length > rowIndex) {
                tableContents[dias[i]][rowIndex].innerHTML = '<a href=\'#\'>' + nomeDaMateria + '</a>';
                tableContents[dias[i]][rowIndex].onclick = onclick;
                tableContents[dias[i]][rowIndex].style.background = '#E6ECF7';
            } else {
                console.error(`Índice da linha ${rowIndex} fora do intervalo para o dia ${dias[i]}`);
            }
        }
    }
}




    // Remover linhas vazias da tabela
    /*
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
*/

})();

