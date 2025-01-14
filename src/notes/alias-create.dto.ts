/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AliasCreateDto {
  /**
   * The note id or alias, which identifies the note the alias should be added to
   */
  @IsString()
  @ApiProperty()
  noteIdOrAlias: string;

  /**
   * The new alias
   */
  @IsString()
  @ApiProperty()
  newAlias: string;
}
