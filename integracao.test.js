import app from '../src/app.js';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ClienteFactory } from './factories/ClienteFactory.js';
import { MontadoraFactory } from './factories/MontadoraFactory.js';
import { VeiculoFactory } from './factories/VeiculoFactory.js';
import { clearDatabase } from './utils/clearDatabase.js';

describe('API de montadoras', () => {
    beforeEach(async () => {
        await MontadoraFactory.create(
            'Toyota',
            'Japão'
        );

        vi.clearAllMocks();
    });

    afterEach(async () => {
        await clearDatabase();

        vi.resetAllMocks();
    });

    it('CT-001 - deve cadastrar uma nova montadora com sucesso.', async () => {
        const response = await request(app)
            .post('/montadoras')
            .send({
                nome: 'Ferrari',
                pais: 'Itália'
            });

        expect(response.status).toBe(201);
        expect(response.body.data).toHaveProperty('insertId');
    });

    it('CT-002 - deve listar as montadoras cadastradas.', async () => {
        const response = await request(app)
            .get('/montadoras');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('data');
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('CT-003 - deve atualizar os dados de uma montadora.', async () => {
        const montadora = await MontadoraFactory.create(
            'Ferrari',
            'Itália'
        );

        const id = montadora.insertId || montadora.id || montadora.Id;

        const response = await request(app)
            .put(`/montadoras?id=${id}`)
            .send({
                nome: 'Ferrari Automóveis',
                pais: 'Itália'
            });

        expect(response.status).toBe(200);

        const consulta = await request(app)
            .get('/montadoras');

        expect(consulta.status).toBe(200);

        const montadoraAtualizada = consulta.body.data.find(
            montadora =>
                montadora.Id === id ||
                montadora.id === id
        );

        expect(montadoraAtualizada).toBeDefined();

        expect(
            montadoraAtualizada.Nome || montadoraAtualizada.nome
        ).toBe('Ferrari Automóveis');
    });

    it('CT-004 - deve excluir uma montadora sem vínculos.', async () => {
        const montadora = await MontadoraFactory.create(
            'Ferrari',
            'Itália'
        );

        const id = montadora.insertId || montadora.id || montadora.Id;

        const response = await request(app)
            .delete(`/montadoras/${id}`);

        expect([200, 204]).toContain(response.status);

        const consulta = await request(app)
            .get('/montadoras');

        expect(consulta.status).toBe(200);

        const montadoraExcluida = consulta.body.data.find(
            montadora =>
                montadora.Id === id ||
                montadora.id === id
        );

        expect(montadoraExcluida).toBeUndefined();
    });

    it('CT-005 - não deve permitir excluir uma montadora vinculada a um veículo.', async () => {
        const cliente = await ClienteFactory.create(
            'João Silva',
            '12345678901',
            '13000000',
            'Rua Teste',
            'Centro',
            'Campinas',
            'SP',
            100,
            'Casa'
        );

        const montadora = await MontadoraFactory.create(
            'Ferrari',
            'Itália'
        );

        await VeiculoFactory.create(
            'F40',
            'ABC1234',
            2020,
            'Vermelho',
            800000,
            cliente.id,
            montadora.id
        );

        const id = montadora.insertId || montadora.id || montadora.Id;

        const response = await request(app)
            .delete(`/montadoras/${id}`);

        expect(response.status).not.toBe(200);
        expect(response.status).not.toBe(204);
    });

    it('CT-006 - deve cadastrar um novo cliente com sucesso.', async () => {
        const response = await request(app)
            .post('/clientes')
            .send({
                nome: 'João da Silva',
                CPF: '1234567801',
                CEP: '13185880',
                logradouro: 'Rua das Flores',
                bairro: 'Centro',
                cidade: 'Campinas',
                UF: 'SP',
                numero: 123,
                complemento: 'Casa'
            });

        expect(response.status).toBe(201);
        expect(response.body.data).toHaveProperty('insertId');
    });

    it('CT-007 - deve listar os clientes cadastrados.', async () => {
        await ClienteFactory.create(
            'Carlos Silva',
            '98765432100',
            '13000000',
            'Rua A',
            'Centro',
            'Campinas',
            'SP',
            200,
            'Casa'
        );

        const response = await request(app)
            .get('/clientes');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('data');
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('CT-008 - deve atualizar os dados de um cliente.', async () => {
        const cliente = await ClienteFactory.create(
            'Carlos Silva',
            '1234567802',
            '13185880',
            'Rua das Flores',
            'Centro',
            'Campinas',
            'SP',
            123,
            'Casa'
        );

        const id = cliente.insertId || cliente.id || cliente.Id;
        const response = await request(app)
            .put(`/clientes?id=${id}`)
            .send({
                nome: 'Carlos Santos',
                CPF: '1234567802',
                CEP: '13185880',
                logradouro: 'Rua Nova',
                bairro: 'Centro',
                cidade: 'Campinas',
                UF: 'SP',
                numero: 456,
                complemento: 'Apartamento'
            });

        expect(response.status).toBe(200);

        const consulta = await request(app)
            .get('/clientes');

        expect(consulta.status).toBe(200);

        const clienteAtualizado = consulta.body.data.find(
            cliente =>
                cliente.Id === id ||
                cliente.id === id
        );

        expect(clienteAtualizado).toBeDefined();
        expect(
            clienteAtualizado.Nome || clienteAtualizado.nome
        ).toBe('Carlos Santos');
    });

    it('CT-009 - deve excluir um cliente sem vínculos.', async () => {
        const cliente = await ClienteFactory.create(
            'Pedro Silva',
            '98765432111',
            '13000000',
            'Rua C',
            'Centro',
            'Campinas',
            'SP',
            300,
            'Casa'
        );

        const id = cliente.insertId || cliente.id || cliente.Id;

        const response = await request(app)
            .delete(`/clientes/${id}`);

        expect([200, 204]).toContain(response.status);

        const consulta = await request(app)
            .get('/clientes');

        expect(consulta.status).toBe(200);

        const clienteExcluido = consulta.body.data.find(
            cliente =>
                cliente.Id === id ||
                cliente.id === id
        );

        expect(clienteExcluido).toBeUndefined();
    });

    it('CT-010 - não deve permitir excluir um cliente vinculado a um veículo.', async () => {
        const cliente = await ClienteFactory.create(
            'José Silva',
            '11122233344',
            '13000000',
            'Rua D',
            'Centro',
            'Campinas',
            'SP',
            400,
            'Casa'
        );

        const montadora = await MontadoraFactory.create(
            'Toyota',
            'Japão'
        );

        await VeiculoFactory.create(
            'Corolla',
            'XYZ5678',
            2020,
            'Preto',
            80000,
            cliente.id,
            montadora.id
        );

        const id = cliente.insertId || cliente.id || cliente.Id;

        const response = await request(app)
            .delete(`/clientes/${id}`);

        expect(response.status).not.toBe(200);
        expect(response.status).not.toBe(204);
    });
});