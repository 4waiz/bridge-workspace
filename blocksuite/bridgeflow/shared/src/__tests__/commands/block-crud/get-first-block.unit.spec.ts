/**
 * @vitest-environment happy-dom
 */
import { describe, expect, it } from 'vitest';

import { getFirstBlockCommand } from '../../../commands/block-crud/get-first-content-block';
import { bridgeflow } from '../../../test-utils';

describe('commands/block-crud', () => {
  describe('getFirstBlockCommand', () => {
    it('should return null when root is not exists', () => {
      const host = bridgeflow`<bridgeflow-page></bridgeflow-page>`;

      const [_, { firstBlock }] = host.command.exec(getFirstBlockCommand, {
        role: 'content',
        root: undefined,
      });

      expect(firstBlock).toBeNull();
    });

    it('should return first block with content role when found', () => {
      const host = bridgeflow`
        <bridgeflow-page>
          <bridgeflow-note id="note-1">
            <bridgeflow-paragraph id="paragraph-1-1">First Paragraph</bridgeflow-paragraph>
            <bridgeflow-paragraph id="paragraph-1-2">Second Paragraph</bridgeflow-paragraph>
          </bridgeflow-note>
          <bridgeflow-note id="note-2">
            <bridgeflow-paragraph id="paragraph-2-1">First Paragraph</bridgeflow-paragraph>
            <bridgeflow-paragraph id="paragraph-2-2">Second Paragraph</bridgeflow-paragraph>
          </bridgeflow-note>
        </bridgeflow-page>
      `;

      const [_, { firstBlock }] = host.command.exec(getFirstBlockCommand, {
        role: 'hub',
        root: undefined,
      });

      expect(firstBlock?.id).toBe('note-1');
    });

    it('should return first block with any role in the array when found', () => {
      const host = bridgeflow`
        <bridgeflow-page>
          <bridgeflow-note id="note-1">
            <bridgeflow-paragraph id="paragraph-1-1">First Paragraph</bridgeflow-paragraph>
            <bridgeflow-paragraph id="paragraph-1-2">Second Paragraph</bridgeflow-paragraph>
          </bridgeflow-note>
          <bridgeflow-note id="note-2">
            <bridgeflow-paragraph id="paragraph-2-1">First Paragraph</bridgeflow-paragraph>
            <bridgeflow-paragraph id="paragraph-2-2">Second Paragraph</bridgeflow-paragraph>
          </bridgeflow-note>
        </bridgeflow-page>
      `;

      const [_, { firstBlock }] = host.command.exec(getFirstBlockCommand, {
        role: ['hub', 'content'],
        root: undefined,
      });

      expect(firstBlock?.id).toBe('note-1');
    });

    it('should return first block with specified flavour when found', () => {
      const host = bridgeflow`
        <bridgeflow-page>
          <bridgeflow-note id="note-1">
            <bridgeflow-paragraph id="paragraph-1">Paragraph</bridgeflow-paragraph>
            <bridgeflow-list id="list-1">List Item</bridgeflow-list>
          </bridgeflow-note>
        </bridgeflow-page>
      `;

      const note = host.store.getBlock('note-1')?.model;

      const [_, { firstBlock }] = host.command.exec(getFirstBlockCommand, {
        flavour: 'bridgeflow:list',
        root: note,
      });

      expect(firstBlock?.id).toBe('list-1');
    });

    it('should return first block with any flavour in the array when found', () => {
      const host = bridgeflow`
        <bridgeflow-page>
          <bridgeflow-note id="note-1">
            <bridgeflow-paragraph id="paragraph-1">Paragraph</bridgeflow-paragraph>
            <bridgeflow-list id="list-1">List Item</bridgeflow-list>
          </bridgeflow-note>
        </bridgeflow-page>
      `;

      const note = host.store.getBlock('note-1')?.model;

      const [_, { firstBlock }] = host.command.exec(getFirstBlockCommand, {
        flavour: ['bridgeflow:list', 'bridgeflow:code'],
        root: note,
      });

      expect(firstBlock?.id).toBe('list-1');
    });

    it('should return first block matching both role and flavour when both specified', () => {
      const host = bridgeflow`
        <bridgeflow-page>
          <bridgeflow-note id="note-1">
            <bridgeflow-paragraph id="paragraph-1">Content Paragraph</bridgeflow-paragraph>
            <bridgeflow-list id="list-1">Content List</bridgeflow-list>
            <bridgeflow-paragraph id="paragraph-2">hub Paragraph</bridgeflow-paragraph>
          </bridgeflow-note>
        </bridgeflow-page>
      `;

      const note = host.store.getBlock('note-1')?.model;
      const [_, { firstBlock }] = host.command.exec(getFirstBlockCommand, {
        role: 'content',
        flavour: 'bridgeflow:list',
        root: note,
      });

      expect(firstBlock?.id).toBe('list-1');
    });

    it('should return first block with default roles when role not specified', () => {
      const host = bridgeflow`
        <bridgeflow-page>
          <bridgeflow-note id="note-1">
            <bridgeflow-paragraph id="paragraph-1">hub Paragraph</bridgeflow-paragraph>
            <bridgeflow-paragraph id="paragraph-2">Content Paragraph</bridgeflow-paragraph>
            <bridgeflow-paragraph id="paragraph-3">Hub Paragraph</bridgeflow-paragraph>
          </bridgeflow-note>
        </bridgeflow-page>
      `;

      const [_, { firstBlock }] = host.command.exec(getFirstBlockCommand, {
        root: undefined,
      });

      expect(firstBlock?.id).toBe('note-1');
    });

    it('should return first block with specified role when found', () => {
      const host = bridgeflow`
        <bridgeflow-page>
          <bridgeflow-note id="note-1">
            <bridgeflow-paragraph id="paragraph-1">Content Paragraph</bridgeflow-paragraph>
            <bridgeflow-paragraph id="paragraph-2">hub Paragraph</bridgeflow-paragraph>
            <bridgeflow-database id="database-1">Database</bridgeflow-database>
          </bridgeflow-note>
        </bridgeflow-page>
      `;

      const note = host.store.getBlock('note-1')?.model;

      const [_, { firstBlock }] = host.command.exec(getFirstBlockCommand, {
        role: 'hub',
        root: note,
      });

      expect(firstBlock?.id).toBe('database-1');
    });

    it('should return null when no blocks with specified role are found in children', () => {
      const host = bridgeflow`
        <bridgeflow-page>
          <bridgeflow-note id="note-1">
            <bridgeflow-paragraph id="paragraph-1">Content Paragraph</bridgeflow-paragraph>
            <bridgeflow-paragraph id="paragraph-2">Another Content Paragraph</bridgeflow-paragraph>
          </bridgeflow-note>
        </bridgeflow-page>
      `;

      const note = host.store.getBlock('note-1')?.model;

      const [_, { firstBlock }] = host.command.exec(getFirstBlockCommand, {
        role: 'hub',
        root: note,
      });

      expect(firstBlock).toBeNull();
    });

    it('should return null when no blocks with specified flavour are found in children', () => {
      const host = bridgeflow`
        <bridgeflow-page>
          <bridgeflow-note id="note-1">
            <bridgeflow-paragraph id="paragraph-1">Paragraph</bridgeflow-paragraph>
            <bridgeflow-paragraph id="paragraph-2">Another Paragraph</bridgeflow-paragraph>
          </bridgeflow-note>
        </bridgeflow-page>
      `;

      const note = host.store.getBlock('note-1')?.model;

      const [_, { firstBlock }] = host.command.exec(getFirstBlockCommand, {
        flavour: 'bridgeflow:list',
        root: note,
      });

      expect(firstBlock).toBeNull();
    });

    it('should return first block with specified role within specified root subtree', () => {
      const host = bridgeflow`
        <bridgeflow-page>
          <bridgeflow-note id="note-1">
            <bridgeflow-paragraph id="paragraph-1-1">1-1 Content</bridgeflow-paragraph>
            <bridgeflow-paragraph id="paragraph-1-2">1-2 hub</bridgeflow-paragraph>
          </bridgeflow-note>
          <bridgeflow-note id="note-2">
            <bridgeflow-paragraph id="paragraph-2-1">2-1 hub</bridgeflow-paragraph>
            <bridgeflow-paragraph id="paragraph-2-2">2-2 Content</bridgeflow-paragraph>
          </bridgeflow-note>
        </bridgeflow-page>
      `;

      const note = host.store.getBlock('note-2')?.model;

      const [_, { firstBlock }] = host.command.exec(getFirstBlockCommand, {
        role: 'content',
        root: note,
      });

      expect(firstBlock?.id).toBe('paragraph-2-1');
    });
  });
});
