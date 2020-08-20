<template>
    <v-layout align-start>
        <v-col cols=12>
            <v-toolbar flat color="white">
                <v-toolbar-title>Conciliacion</v-toolbar-title>
                <v-snackbar
                    v-model="snackbar"
                    :timeout="timeout"
                    right
                    color="error"
                    >
                    {{ snacktext }}
                    <v-btn 
                        color="error"
                        dark
                        vertical
                        text
                        @click="snackbar = false"
                    >
                        Cerrar
                    </v-btn>
                </v-snackbar>                     
                <v-divider
                class="mx-2"
                inset
                vertical
                ></v-divider>
                <v-spacer></v-spacer>
                <v-text-field class="text-xs-center" v-model="search" append-icon="search" label="Búsqueda" single-line hide-details></v-text-field>
                <v-spacer></v-spacer>
            </v-toolbar>
            <v-dialog v-model="dialog" max-width="1100px" persistent>
                <v-card>
                    <v-toolbar color="blue darken-3" dark>
                        <v-toolbar-title>Carga de Conciliaciones # {{empresa}} - {{asocuenta}} - {{aniomes}}</v-toolbar-title>
                    </v-toolbar>
                    <v-card-text>
                        <v-card-actions>
                            <v-card-title>Sin Conciliar</v-card-title>
                            <v-spacer></v-spacer>
                            <v-btn :disabled="!(selected.length>0)" color="orange" dark class="mb-2" @click.native="armaAjuste()">Ajustes</v-btn>
                            <v-btn :disabled="!(selected.length==1)" color="orange" dark class="mb-2" @click.native="armaApertura()">Aperturas</v-btn>
                            <v-spacer></v-spacer>
                            <v-btn :disabled="!selected.length" color="primary" dark class="mb-2" @click.native="verSeleccionados">Seleccionados</v-btn>
                            <v-btn color="primary" dark class="mb-2" @click.native="verConciliados">Conciliados</v-btn>
                            <v-btn color="success" dark class="mb-2" @click.native="closeDetail">Salir</v-btn>
                        </v-card-actions>
                        <v-row align="start">
                            <v-col cols="12" sm="4">
                                <v-select  
                                    v-model="origenFilterValue" 
                                    :items="origenes"
                                    chips 
                                    append-icon="zoom_in" 
                                    label="Origen" 
                                    clearable
                                    multiple
                                    outlined
                                    dense>
                                </v-select>
                            </v-col>
                            <v-col cols="12" sm="8">
                                <v-text-field 
                                    v-model="search" 
                                    append-icon="search" 
                                    label="Búsqueda" 
                                    clearable
                                    dense>
                                </v-text-field>
                            </v-col>
                            <v-col cols="12" sm="12" md="12">
                                <v-data-table
                                    v-model="selected"
                                    :headers="headersDetallePend"
                                    :items="nocmovs"
                                    :search="search"
                                    multi-sort
                                    must-sort
                                    sort-desc
                                    :sort-by="ordenacion"
                                    show-select
                                    :single-expand="singleExpand"
                                    :expanded.sync="expandedSC"
                                    show-expand
                                    class="elevation-1"
                                    >
                                    <template v-slot:[`item.origen`]="{ item }">
                                        <v-chip v-if="item.origen==='CON'" class="ma-2" color="teal" text-color="white">{{ item.origen }}</v-chip>
                                        <v-chip v-else-if="item.origen==='BAN'" class="ma-2" color="secondary" text-color="white">{{ item.origen }}</v-chip>
                                        <v-chip v-else class="ma-2" color="red darken-4" text-color="white">{{ item.origen }}</v-chip>
                                    </template>
                                    <template v-slot:[`item.fecha`]="{ item }">
                                        <p class="text-center">{{ item.fecha.substr(0, 10) }}</p>
                                    </template>
                                    <template v-slot:[`item.importe`]="{ item }">
                                        <v-chip v-if="item.origen==='CON'" class="ma-2" color="teal" text-color="white">{{ formatPrice(item.importe)}}</v-chip>
                                        <v-chip v-else-if="item.origen==='BAN'" class="ma-2" color="secondary" text-color="white">{{ formatPrice(item.importe)}}</v-chip>
                                        <v-chip v-else class="ma-2" color="red darken-4" text-color="white">{{ formatPrice(item.importe)}}</v-chip>
                                    </template>
                                    <!-- <template v-slot:item.unsgimporte="{ item }">
                                        <p class="text-right">{{ formatPrice(item.unsgimporte)}}</p>
                                    </template> -->
                                    <template v-slot:[`item.fecalta`]="{ item }">
                                        <td>{{ item.fecalta.substr(0, 16) }}</td>
                                    </template>
                                    <template v-slot:[`item.fecumod`]="{ item }">
                                        <td>{{ item.fecumod.substr(0, 16) }}</td>
                                    </template>
                                    <template v-slot:expanded-item="{ headers, item }">
                                        <td :colspan="headers.length">Info {{ item.ref0 }} {{ item.ref2 }} {{ item.ref3 }} {{ item.ref4 }} {{ item.ref5 }} {{ item.ref6 }} {{ item.ref7 }} {{ item.ref8 }} {{ item.ref9 }}</td>
                                    </template>
                                    <template v-slot:no-data>
                                        <v-btn color="primary" @click="listarDetail">Resetear</v-btn>
                                    </template>

                                </v-data-table>
                            </v-col>
                        </v-row>
                        <v-dialog v-model="copartidas" max-width="1100px" persistent>
                            <v-card>
                                <v-toolbar color="blue darken-3" dark>
                                    <v-toolbar-title>Carga de Conciliaciones # {{empresa}} - {{asocuenta}} - {{aniomes}}</v-toolbar-title>
                                </v-toolbar>
                                <v-card-text>
                                    <v-card-actions>
                                        <v-card-title>Conciliados</v-card-title>
                                        <v-spacer></v-spacer>
                                        <v-btn :disabled="!reversed.length" color="primary" dark class="mb-2" @click.native="desconciliarPartidas">Reversar</v-btn>
                                        <v-btn color="success" dark class="mb-2" @click.native="copartidas=false">Salir</v-btn>
                                    </v-card-actions>
                                    <v-row align="start">
                                        <v-col cols="12" sm="4">
                                            <v-select  
                                                v-model="origenFilterValue" 
                                                :items="origenes"
                                                chips 
                                                append-icon="zoom_in" 
                                                label="Origen" 
                                                clearable
                                                multiple
                                                outlined
                                                dense>
                                            </v-select>
                                        </v-col>
                                        <v-col cols="12" sm="8">
                                            <v-text-field 
                                                v-model="search" 
                                                append-icon="search" 
                                                label="Búsqueda" 
                                                clearable
                                                dense>
                                            </v-text-field>
                                        </v-col>
                                        <v-col cols="12" sm="12" md="12">
                                            <v-data-table
                                                v-model="reversed"
                                                :headers="headersDetalleConc"
                                                :items="conmovs"
                                                :search="search"
                                                show-select
                                                multi-sort
                                                sort-desc
                                                :single-expand="singleExpand"
                                                :expanded.sync="expandedPC"
                                                show-expand                                            
                                                :sort-by="ordenacion"
                                                class="elevation-1"
                                                >
                                                <template v-slot:[`item.origen`]="{ item }">
                                                    <v-chip v-if="item.origen==='CON'" class="ma-2" color="teal" text-color="white">{{ item.origen }}</v-chip>
                                                    <v-chip v-else-if="item.origen==='BAN'" class="ma-2" color="secondary" text-color="white">{{ item.origen }}</v-chip>
                                                    <v-chip v-else class="ma-2" color="red darken-4" text-color="white">{{ item.origen }}</v-chip>
                                                </template>
                                                <template v-slot:[`item.fecha`]="{ item }">
                                                    <p class="text-center" >{{ item.fecha.substr(0, 10) }}</p>
                                                </template>
                                                <template v-slot:[`item.importe`]="{ item }">
                                                    <v-chip v-if="item.origen==='CON'" class="ma-2" color="teal" text-color="white">{{ formatPrice(item.importe)}}</v-chip>
                                                    <v-chip v-else-if="item.origen==='BAN'" class="ma-2" color="secondary" text-color="white">{{ formatPrice(item.importe)}}</v-chip>
                                                    <v-chip v-else class="ma-2" color="red darken-4" text-color="white">{{ formatPrice(item.importe)}}</v-chip>
                                                </template>
                                                <!-- <template v-slot:item.unsgimporte="{ item }">
                                                    <p class="text-right">{{ formatPrice(item.unsgimporte)}}</p>
                                                </template> -->
                                                <template v-slot:[`item.fecalta`]="{ item }">
                                                    <td>{{ item.fecalta.substr(0, 16) }}</td>
                                                </template>
                                                <template v-slot:[`item.fecumod`]="{ item }">
                                                    <td>{{ item.fecumod.substr(0, 16) }}</td>
                                                </template>
                                                <template v-slot:expanded-item="{ headers, item }">
                                                    <td :colspan="headers.length">Info {{ item.ref0 }} {{ item.ref2 }} {{ item.ref3 }} {{ item.ref4 }} {{ item.ref5 }} {{ item.ref6 }} {{ item.ref7 }} {{ item.ref8 }} {{ item.ref9 }}</td>
                                                </template>
                                                <template v-slot:no-data>
                                                    <v-btn color="primary" @click="listarDetail">Resetear</v-btn>
                                                </template>
                                            </v-data-table>
                                        </v-col>
                                    </v-row>
                                </v-card-text>
                            </v-card>
                        </v-dialog>
                        <v-dialog v-model="adpartidas" max-width="1100px" persistent>
                            <v-card>
                                <v-toolbar color="blue darken-3" dark>
                                    <v-toolbar-title>Carga de Conciliaciones # {{empresa}} - {{asocuenta}} - {{aniomes}}</v-toolbar-title>
                                </v-toolbar>
                                <v-card-text>
                                    <v-card-actions>
                                        <v-card-title>Seleccionados</v-card-title>
                                        <v-spacer></v-spacer>
                                        <v-btn :disabled="!(totalPagado==0 && selected.length)" color="primary" dark class="mb-2" @click.native="guardarSelected">Grabar</v-btn>
                                        <v-btn color="success" dark class="mb-2" @click.native="adpartidas=false">Salir</v-btn>
                                    </v-card-actions>
                                    <v-row align="start">
                                        <v-card-text>                            
                                            <v-col cols="12"  sm="12" md="12">
                                                <v-data-table
                                                    :headers="headersDetalleSelec"
                                                    :items="selected"
                                                    :search="search"
                                                    :single-expand="singleExpand"
                                                    :expanded.sync="expandedPS"
                                                    show-expand
                                                    class="elevation-1"
                                                    >
                                                    <template v-slot:[`item.origen`]="{ item }">
                                                        <v-chip v-if="item.origen==='CON'" class="ma-2" color="teal" text-color="white">{{ item.origen }}</v-chip>
                                                        <v-chip v-else-if="item.origen==='BAN'" class="ma-2" color="secondary" text-color="white">{{ item.origen }}</v-chip>
                                                        <v-chip v-else class="ma-2" color="red darken-4" text-color="white">{{ item.origen }}</v-chip>
                                                    </template>
                                                    <template v-slot:[`item.fecha`]="{ item }">
                                                        <p class="text-center">{{ item.fecha.substr(0, 10) }}</p>
                                                    </template>
                                                    <template v-slot:[`item.importe`]="{ item }">
                                                        <v-chip v-if="item.origen==='CON'" class="ma-2" color="teal" text-color="white">{{ formatPrice(item.importe)}}</v-chip>
                                                        <v-chip v-else-if="item.origen==='BAN'" class="ma-2" color="secondary" text-color="white">{{ formatPrice(item.importe)}}</v-chip>
                                                        <v-chip v-else class="ma-2" color="red darken-4" text-color="white">{{ formatPrice(item.importe)}}</v-chip>
                                                    </template>
                                                    <!-- <template v-slot:item.unsgimporte="{ item }">
                                                        <p class="text-right">{{ formatPrice(item.unsgimporte)}}</p>
                                                    </template> -->
                                                    <template v-slot:[`item.fecalta`]="{ item }">
                                                        <td>{{ item.fecalta.substr(0, 16) }}</td>
                                                    </template>
                                                    <template v-slot:[`item.fecumod`]="{ item }">
                                                        <td>{{ item.fecumod.substr(0, 16) }}</td>
                                                    </template>
                                                    <template v-slot:expanded-item="{ headers, item }">
                                                        <td :colspan="headers.length">Info {{ item.ref0 }} {{ item.ref2 }} {{ item.ref3 }} {{ item.ref4 }} {{ item.ref5 }} {{ item.ref6 }} {{ item.ref7 }} {{ item.ref8 }} {{ item.ref9 }}</td>
                                                    </template>
                                                    <template v-slot:no-data>
                                                        <v-btn color="primary" @click="listarDetail">Sin Items</v-btn>
                                                    </template>
                                                </v-data-table>
                                            </v-col>
                                            <v-col cols=12 align="end">
                                                <strong>Total partidas: </strong>$ {{totalPagado=(calcularTotal).toFixed(2)}}
                                            </v-col>
                                        </v-card-text>
                                    </v-row>
                                </v-card-text>
                            </v-card>
                        </v-dialog>
                        <v-dialog v-model="adajustes" max-width="1100px" persistent>
                            <v-card>
                                <v-toolbar color="orange" dark>
                                    <v-toolbar-title>Carga de Conciliaciones # {{empresa}} - {{asocuenta}} - {{aniomes}}</v-toolbar-title>
                                </v-toolbar>
                                <v-card-text>
                                    <v-card-actions>
                                        <v-card-title>Ajustes</v-card-title>
                                        <v-spacer></v-spacer>
                                        <v-btn :disabled="!(totalAjustado==0 && selected.length)" color="primary" dark class="mb-2" @click.native="guardarAjuste">Grabar</v-btn>
                                        <v-btn color="success" dark class="mb-2" @click.native="adajustes=false">Salir</v-btn>
                                    </v-card-actions>
                                    <v-row align="start">
                                        <v-col cols="12" sm="4">
                                            <v-select  
                                                v-model="origenFilterValue" 
                                                :items="origenes"
                                                chips 
                                                append-icon="zoom_in" 
                                                label="Origen" 
                                                clearable
                                                multiple
                                                outlined
                                                dense>
                                            </v-select>
                                        </v-col>
                                        <v-col cols="12" sm="8">
                                            <v-text-field 
                                                v-model="search" 
                                                append-icon="search" 
                                                label="Búsqueda" 
                                                clearable
                                                dense>
                                            </v-text-field>
                                        </v-col>
                                        <v-col cols="12"  sm="12" md="12">
                                            <v-data-table
                                                :headers="headersDetalleSelec"
                                                :items="ajustes"
                                                :search="search"
                                                :single-expand="singleExpand"
                                                :expanded.sync="expandedPS"
                                                show-expand
                                                class="elevation-1"
                                                >
                                                <template v-slot:[`item.origen`]="{ item }">
                                                    <v-chip v-if="item.origen==='CON'" class="ma-2" color="teal" text-color="white">{{ item.origen }}</v-chip>
                                                    <v-chip v-else-if="item.origen==='BAN'" class="ma-2" color="secondary" text-color="white">{{ item.origen }}</v-chip>
                                                    <v-chip v-else class="ma-2" color="red darken-4" text-color="white">{{ item.origen }}</v-chip>
                                                </template>
                                                <template v-slot:[`item.fecha`]="{ item }">
                                                    <p class="text-center">{{ item.fecha.substr(0, 10) }}</p>
                                                </template>
                                                <template v-slot:[`item.importe`]="{ item }">
                                                    <v-chip v-if="item.origen==='CON'" class="ma-2" color="teal" text-color="white">{{ formatPrice(item.importe)}}</v-chip>
                                                    <v-chip v-else-if="item.origen==='BAN'" class="ma-2" color="secondary" text-color="white">{{ formatPrice(item.importe)}}</v-chip>
                                                    <v-chip v-else class="ma-2" color="red darken-4" text-color="white">{{ formatPrice(item.importe)}}</v-chip>
                                                </template>
                                                <!-- <template v-slot:item.unsgimporte="{ item }">
                                                    <p class="text-right">{{ formatPrice(item.unsgimporte)}}</p>
                                                </template> -->
                                                <template v-slot:[`item.fecalta`]="{ item }">
                                                    <td>{{ item.fecalta.substr(0, 16) }}</td>
                                                </template>
                                                <template v-slot:[`item.fecumod`]="{ item }">
                                                    <td>{{ item.fecumod.substr(0, 16) }}</td>
                                                </template>
                                                <template v-slot:expanded-item="{ headers, item }">
                                                    <td :colspan="headers.length">Info {{ item.ref0 }} {{ item.ref2 }} {{ item.ref3 }} {{ item.ref4 }} {{ item.ref5 }} {{ item.ref6 }} {{ item.ref7 }} {{ item.ref8 }} {{ item.ref9 }}</td>
                                                </template>
                                                <template v-slot:no-data>
                                                    <v-btn color="primary" @click="listarDetail">Sin Items</v-btn>
                                                </template>
                                            </v-data-table>
                                        </v-col>
                                        <v-col cols=12 align="end">
                                            <strong>Total partidas: </strong>$ {{totalAjustado=(calcularAjustes).toFixed(2)}}
                                        </v-col>
                                    </v-row>
                                </v-card-text>
                            </v-card>
                        </v-dialog>
                        <v-dialog v-model="adaperturas" max-width="1100px" persistent>
                            <v-card>
                                <v-toolbar color="orange" dark>
                                    <v-toolbar-title>Carga de Conciliaciones # {{empresa}} - {{asocuenta}} - {{aniomes}}</v-toolbar-title>
                                </v-toolbar>
                                <v-card-actions>
                                    <v-card-title>Aperturas : {{selected[0]?selected[0].fecha.substr(0,10):""}} {{selected[0]?selected[0].origen:""}} {{selected[0]?selected[0].grpconcepto:""}} $ {{selected[0]?formatPrice(selected[0].importe):""}}</v-card-title>
                                    <v-spacer></v-spacer>
                                    <v-btn color="primary" dark class="mb-2" @click.native="guardarApertura">Grabar</v-btn>
                                    <v-btn color="success" dark class="mb-2" @click.native="adaperturas=false">Salir</v-btn>
                                </v-card-actions>
                                <v-card-text>                            
                                    <v-row align="start">
                                        <v-col cols="12" sm="4">
                                            <v-select  
                                                v-model="origenFilterValue" 
                                                :items="origenes"
                                                chips 
                                                append-icon="zoom_in" 
                                                label="Origen" 
                                                clearable
                                                multiple
                                                outlined
                                                dense>
                                            </v-select>
                                        </v-col>
                                        <v-col cols="12" sm="8">
                                            <v-text-field 
                                                v-model="search" 
                                                append-icon="search" 
                                                label="Búsqueda" 
                                                clearable
                                                dense>
                                            </v-text-field>
                                        </v-col>
                                        <v-col cols="12"  sm="12" md="12">
                                            <v-data-table
                                                :headers="headersDetalleSelec"
                                                :items="aperturas"
                                                :search="search"
                                                :single-expand="singleExpand"
                                                :expanded.sync="expandedPS"
                                                show-expand
                                                class="elevation-1"
                                                >
                                                <template v-slot:[`item.origen`]="{ item }">
                                                    <v-chip v-if="item.origen==='CON'" class="ma-2" color="teal" text-color="white">{{ item.origen }}</v-chip>
                                                    <v-chip v-else-if="item.origen==='BAN'" class="ma-2" color="secondary" text-color="white">{{ item.origen }}</v-chip>
                                                    <v-chip v-else class="ma-2" color="red darken-4" text-color="white">{{ item.origen }}</v-chip>
                                                </template>
                                                <template v-slot:[`item.fecha`]="{ item }">
                                                    <p class="text-center">{{ item.fecha.substr(0, 10) }}</p>
                                                </template>
                                                <template v-slot:[`item.importe`]="{ item }">
                                                    <v-edit-dialog
                                                        :return-value.sync="item.importe"
                                                        large
                                                        persistent
                                                        @save="splitApertura"
                                                    >
                                                        <v-chip  color="red darken-4" text-color="white">{{ formatPrice(item.importe) }}</v-chip>
                                                        <template v-slot:input>
                                                        <v-text-field
                                                            v-model="item.importe"
                                                            type="number"
                                                            :rules="[max14chars]"
                                                            label="Edit"
                                                            single-line
                                                            color="red darken-4" 
                                                            text-color="white"
                                                            autofocus
                                                        ></v-text-field>
                                                        </template>
                                                    </v-edit-dialog>
                                                </template>
                                                <!-- <template v-slot:item.unsgimporte="{ item }">
                                                    <p class="text-right">{{ formatPrice(item.unsgimporte)}}</p>
                                                </template> -->
                                                <template v-slot:[`item.fecalta`]="{ item }">
                                                    <td>{{ item.fecalta.substr(0, 16) }}</td>
                                                </template>
                                                <template v-slot:[`item.fecumod`]="{ item }">
                                                    <td>{{ item.fecumod.substr(0, 16) }}</td>
                                                </template>
                                                <template v-slot:expanded-item="{ headers, item }">
                                                    <td :colspan="headers.length">Info {{ item.ref0 }} {{ item.ref2 }} {{ item.ref3 }} {{ item.ref4 }} {{ item.ref5 }} {{ item.ref6 }} {{ item.ref7 }} {{ item.ref8 }} {{ item.ref9 }}</td>
                                                </template>
                                            
                                                <template v-slot:no-data>
                                                    <v-btn color="primary" @click="listarDetail">Sin Items</v-btn>
                                                </template>
                                            </v-data-table>
                                        </v-col>
                                        <v-col cols=12 align="end">
                                            <strong>Total Movimientos: </strong>$ {{totalAperturas=(calcularAperturas).toFixed(2)}}
                                        </v-col>
                                    </v-row>
                                </v-card-text>
                            </v-card>
                        </v-dialog>
                    </v-card-text>
                </v-card>
            </v-dialog>
            <v-data-table
                :headers="headersMaster"
                :items="headermovimientos"
                :search="search"
                class="elevation-1"
                >
                <template v-slot:[`item.actions`]="{ item }">
                    <td class="justify-center layout px-0">
                        <v-icon
                        small
                        class="mr-2"
                        @click="editMasterItem(item)"
                        >
                        tab
                        </v-icon>
                    </td>
                </template>
                <template slot="no-data">
                    <v-btn color="primary" @click="listarMaster">Resetear</v-btn>
                </template>
            </v-data-table>
        </v-col>
    </v-layout>
</template>

<script>
    import axios from 'axios'
    import jsPDF from 'jspdf'
    import autoTable from 'jspdf-autotable'
    export default {
        data: () => {
            return {
                snackbar:false,
                snacktext: '',
                timeout: 4000,
                origenFilterValue: [],
                max14chars: v => v.length <= 14 || 'Demasiado grande!',
                singleExpand: false,
                expandedSC: [],
                expandedPS: [],
                expandedPC: [],
                headermovimientos: [],
                totalPagado: 0,
                totalAjustado: 0,
                totalAperturas: 0,
                selected: [],
                reversed: [],
                ajustes: [],
                aperturas: [],
                conmovs: [],
                nocmovs: [],
                empresas: [],
                bancos: [],
                grpconceptos: [],  
                ordenacion: ["unsgimporte","fecha"],
                origen: '',
                origenes:[
                    { value: 'CON', text: 'CON'},
                    { value: 'BAN', text: 'BAN'},
                    { value: 'APE', text: 'APE'},
                    { value: 'AJU', text: 'AJU'},
                ],
                tipos: [
                    { value: 'CC', text: 'Cuenta Corriente'},
                    { value: 'CA', text: 'Caja de Ahorro'}
                ],
                monedas: [
                    { value: 'ARS', text: 'Peso Argentino'},
                    { value: 'USD', text: 'US Dolar'},
                    { value: 'EUR', text: 'Euro'}
                ],
                // Master
                idproyecto: '',
                orden: '',
                proyecto: '',
                producto: '',
                fecadjudicacion: '',
                ars1usd: '',
                menu1: false,
                dialog: false,
                headersMaster: [
                    { text: '[Opciones]', value: 'actions', align: 'center', sortable: false },
                    { text: 'Empresa', value: 'empresa', align: 'start', sortable: true },
                    { text: 'Cuentas Asociadas', value: 'asocuenta', align: 'start', sortable: true },
                    { text: 'Lote#', value: 'loteId', align: 'center', sortable: true },
                    { text: 'Año/Mes', value: 'aniomes', align: 'center', sortable: true },
                    { text: 'Cantidad', value: 'cantidad', align: 'center', sortable: true },
                ],
                search: '',
                editedIndex: -1,
                id: '',
                empresaId: '',
                bancoId: '',
                tipo: '',
                moneda: '',
                numcuenta: '',
                iduseralta:'',
                fecalta:'',
                iduserumod:'',
                fecumod:'',
                activo:false,                 
                empresa: '',
                asocuenta: '',
                loteId: '',
                aniomes: '',
                cantidad: '',
                valida: 0,
                validaMensaje:[],
                adModal: 0,
                adAccion: 0,
                adNombre: '',
                adId: '',
                adpartidas: false,
                copartidas: false,
                adaperturas: false,
                adajustes: false
            }
        },
        computed: {
            headersDetalleConc() {
                return [
                    // { text: '[Opciones]', value: 'actions', align: 'center', sortable: false },
                    { text: 'Asiento', value: 'asientoId', align: 'start', sortable: true },
                    { text: 'Origen', value: 'origen', align: 'start', sortable: true, filter: this.origenFilter },
                    { text: 'Grupo Conceptos', value: 'grpconcepto', align: 'start', sortable: true },
                    { text: 'Concepto', value: 'concepto', align: 'start', sortable: true },
                    { text: 'Fecha', value: 'fecha', align: 'center', sortable: true },
                    { text: 'Importe', value: 'importe', align: 'center', sortable: true },
                    { text: '', value: 'data-table-expand' },
                ]
            },
            headersDetallePend() {
                return [
                    // { text: '[Opciones]', value: 'actions', align: 'center', sortable: false },
                    { text: 'Origen', value: 'origen', align: 'start', sortable: true, filter: this.origenFilter },
                    { text: 'Grupo Conceptos', value: 'grpconcepto', align: 'start', sortable: true },
                    { text: 'Concepto', value: 'concepto', align: 'start', sortable: true },
                    { text: 'Fecha', value: 'fecha', align: 'center', sortable: true },
                    // { text: 'Abs(Importe)', value: 'unsgimporte', align: 'center', sortable: true },
                    { text: 'Importe', value: 'importe', align: 'center', sortable: true },
                    { text: '', value: 'data-table-expand' },
                ]
            },
            headersDetalleSelec() {
                    return [
                    // { text: '[Opciones]', value: 'actions', align: 'center', sortable: false },
                    { text: 'Origen', value: 'origen', align: 'start', sortable: true, filter: this.origenFilter },
                    { text: 'Grupo Conceptos', value: 'grpconcepto', align: 'start', sortable: true },
                    { text: 'Concepto', value: 'concepto', align: 'start', sortable: true },
                    { text: 'Fecha', value: 'fecha', align: 'center', sortable: true },
                    { text: 'Importe', value: 'importe', align: 'center', sortable: true },
                    { text: '', value: 'data-table-expand' },
                ]
            },
            formTitle () {
                return this.editedIndex === -1 ? 'Nuevo Movimiento' : 'Actualizar Movimiento'
            },
            calcularTotal:function(){
                    var subtotal=0.0;
                    for(var i=0;i<this.selected.length;i++){
                        subtotal+=(this.selected[i].activo?+this.selected[i].importe:0);
                    }
                    return subtotal;
                },
            calcularAjustes:function(){
                    var subtotal=0.0;
                    for(var i=0;i<this.ajustes.length;i++){
                        subtotal+=(this.ajustes[i].activo?+this.ajustes[i].importe:0);
                    }
                    return subtotal;
                },
            calcularAperturas:function(){
                    var subtotal=0.0;
                    for(var i=0;i<this.aperturas.length;i++){
                        subtotal+=(this.aperturas[i].activo?+this.aperturas[i].importe:0);
                    }
                    return subtotal;
                }
            },
        watch: {
            },
            created () {
                this.listarMaster();
                this.select();
            },
        methods:{
            /**
             * Filter for calories column.
             * @param value Value to be tested.
             * @returns {boolean}
             */
            origenFilter(value) {
                // If this filter has no value we just skip the entire filter
                if (this.origenFilterValue.length==0) {
                return true;
                }
                // Check if the current loop value (The calories value)
                // equals to the selected value at the <v-select>.
                return this.origenFilterValue.find(e => e===value);
            },
            formatPrice(value) {
                let val = (value/1).toFixed(2).replace('.', ',')
                return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
            },
            listarMaster(){
                let me=this;
                let header={"Authorization" : "Bearer " + this.$store.state.token};
                let configuracion= {headers : header};
                // console.log(configuracion);
                axios.get('api/Movimientos/Listarheader',configuracion).then(function(response){
                    // console.log(response);
                    me.headermovimientos=response.data;
                }).catch(function(error){
                    me.snacktext = 'Se detectó un error. Código: '+ error.response.status;
                    me.snackbar = true;
                    console.log(error);
                });
            },
            listarDetail(){ 
                let me=this;
                let header={"Authorization" : "Bearer " + this.$store.state.token};
                let configuracion= {headers : header};
                // console.log(configuracion);
                axios.get('api/Movimientos/Listarnoclote/'+me.loteId,configuracion).then(function(response){
                    // console.log(response);
                    me.nocmovs=response.data;
                }).catch(function(error){
                    me.snacktext = 'Se detectó un error. Código: '+ error.response.status;
                    me.snackbar = true;
                    console.log(error);
                });
                axios.get('api/Movimientos/Listarconlote/'+me.loteId,configuracion).then(function(response){
                    // console.log(response);
                    me.conmovs=response.data;
                }).catch(function(error){
                    me.snacktext = 'Se detectó un error. Código: '+ error.response.status;
                    me.snackbar = true;
                    console.log(error);
                });
            },
            select(){
                let me=this;
                var empresasArray=[];
                var bancosArray=[];
                var grpconceptosArray=[];
                let header={"Authorization" : "Bearer " + this.$store.state.token};
                let configuracion= {headers : header};
                axios.get('api/Empresas/Select',configuracion).then(function(response){
                    // console.log(response);
                    empresasArray=response.data;
                    empresasArray.map(function(x){
                        me.empresas.push({text: x.nombre, value:x.id});
                    });
                }).catch(function(error){
                    me.snacktext = 'Se detectó un error. Código: '+ error.response.status;
                    me.snackbar = true;
                    console.log(error);
                });
                axios.get('api/Bancos/Select',configuracion).then(function(response){
                    // console.log(response);
                    bancosArray=response.data;
                    bancosArray.map(function(x){
                        me.bancos.push({text: x.nombre,value:x.id});
                    });
                }).catch(function(error){
                    me.snacktext = 'Se detectó un error. Código: '+ error.response.status;
                    me.snackbar = true;
                    console.log(error);
                });
                axios.get('api/Grpconceptos/Select',configuracion).then(function(response){
                    // console.log(response);
                    grpconceptosArray=response.data;
                    grpconceptosArray.map(function(x){
                        me.grpconceptos.push({text: x.nombre, value:x.id, esajuape:x.esajuape });
                    });
                }).catch(function(error){
                    me.snacktext = 'Se detectó un error. Código: '+ error.response.status;
                    me.snackbar = true;
                    console.log(error);
                });
            },
            editMasterItem (item) {
                this.empresa = item.empresa;
                this.asocuenta = item.asocuenta;
                this.loteId = item.loteId;
                this.aniomes = item.aniomes;
                this.selected = [];
                this.reversed = [];
                this.listarDetail();
                this.dialog = true
            },
            deleteItem (item) {
                let me=this;
                var resulta = confirm('Esta seguro de querer borrar el registro?');
                if (resulta) {
                    let header={"Authorization" : "Bearer " + me.$store.state.token};
                    let configuracion= {headers : header};
                    axios.delete('api/Movimientos/Eliminar/'+item.id,configuracion).then(function(response){
                        me.closeForm();
                        me.listarDetail();
                    }).catch(function(error){
                        me.snacktext = 'Se detectó un error. Código: '+ error.response.status;
                        me.snackbar = true;
                        console.log(error);
                    });
                }
            },
            verSeleccionados(){
                let me=this;             
                me.adpartidas=true;
                me.search='';
                me.origenFilterValue=[];
            },
            verConciliados(){
                let me=this;             
                me.copartidas=true;
                me.search='';
                me.origenFilterValue=[];
            },
            conciliarPartidas(){
                if (this.totalPagado==0){
                    this.guardarSelected();
                }else{
                    this.snacktext = 'Las partidas no balancean';
                    this.snackbar = true;
                }
            },
            desconciliarPartidas(){
                this.guardarReversed();
            },
            guardarSelected(){
                let me=this;             
                var date = new Date();
                var idpks = [];
                idpks = this.selected.map( function (eachobj) {return eachobj.id});
                let header={"Authorization" : "Bearer " + me.$store.state.token};
                let configuracion= {headers : header};
                axios.put('api/Movimientos/Actualizarasiento',{
                    'Id':idpks,
                    'iduserumod': me.$store.state.usuario.idusuario,
                    'fecumod': new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString()                        
                },configuracion).then(function(response){
                    me.selected = [];
                    me.adpartidas = false;
                    me.copartidas = false;
                    me.closeForm();
                    me.limpiarDetail();                      
                    me.listarDetail();
                }).catch(function(error){
                    me.snacktext = 'Se detectó un error. Código: '+ error.response.status;
                    me.snackbar = true;
                    console.log(error);
                });
            },
            guardarReversed(){
                let me=this;             
                var date = new Date();
                var idasientos = [];
                idasientos = this.reversed.map( function (eachobj) {return eachobj.asientoId} );
                idasientos = [...new Set(idasientos)];
                let header={"Authorization" : "Bearer " + me.$store.state.token};
                let configuracion= {headers : header};
                axios.put('api/Movimientos/Borrarasiento',{
                    'Id':idasientos,
                    'iduserumod': me.$store.state.usuario.idusuario,
                    'fecumod': new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString()                        
                },configuracion).then(function(response){
                    me.reversed = [];
                    me.selected = [];
                    me.adpartidas = false;
                    me.copartidas = false;
                    me.closeForm();
                    me.limpiarDetail();                      
                    me.listarDetail();
                }).catch(function(error){
                    me.snacktext = 'Se detectó un error. Código: '+ error.response.status;
                    me.snackbar = true;
                    console.log(error);
                });
            },
            armaAjuste(){
                let me=this;
                me.origenFilterValue=[];
                me.search='';             
                var date = new Date();
                var ahora=new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString();
                me.ajustes=[];
                me.ajustes=me.selected.map(x => Object.assign({},x));
                me.adajustes=true;
                var subtotal=0.0;
                for(var i=0;i<this.ajustes.length;i++){
                    subtotal+=(this.ajustes[i].activo?this.ajustes[i].importe:0);
                }
                me.ajustes.push({origen:'AJU',grpconcepto: me.grpconceptos.find( element => element.esajuape == true)["text"],concepto:'Ajuste en App',fecha:ahora.substr(0,10),importe:subtotal*(-1),activo:true});
            },
            guardarAjuste(){
                let me=this;
                var idpks = [];
                me.ajustes.pop();
                idpks = this.ajustes.map( function (eachobj) {return eachobj.id});
                var date = new Date();
                var ahora=new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().substr(0,10);
                let header={"Authorization" : "Bearer " + me.$store.state.token};
                let configuracion= {headers : header};
                //Código para guardar
                axios.put('api/Movimientos/Crearajuste',{
                    'Id': idpks,
                    'empresaId': me.headermovimientos[0].empresaId,
                    'loteId': me.headermovimientos[0].loteId,
                    'asientoId': null,
                    'origen': 'AJU',
                    'grpconceptoId': me.grpconceptos.find( element => element.esajuape == true)["value"],
                    'concepto': 'Ajuste en App',
                    'fecha': ahora,
                    'importe': + me.totalPagado * (-1),
                    'etlId': null,
                    'iduseralta': me.$store.state.usuario.idusuario                           
                },configuracion).then(function(response){
                    me.adajustes = false;
                    me.ajustes = [];
                    me.selected = [];
                    me.closeForm();
                    me.limpiarDetail();                      
                    me.listarDetail();
                }).catch(function(error){
                    me.snacktext = 'Se detectó un error. Código: '+ error.response.status;
                    me.snackbar = true;
                    console.log(error);
                });            
            },
            armaApertura(){
                let me=this;
                me.adaperturas=true;
                me.origenFilterValue=[];
                me.search='';             
                me.aperturas=[];
                var date = new Date();
                var ahora=new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString();
                me.aperturas.push({empresaId:me.headermovimientos[0].empresaId, loteId:me.headermovimientos[0].loteId,asientoId:null, origen:'APE',
                    grpconcepto: me.grpconceptos.find( element => element.esajuape == true)["text"],concepto:'Ajuste en App',fecha:ahora.substr(0,10),importe:(me.totalPagado*(-1)).toFixed(2),
                    ref0: me.selected[0].ref0, ref1: me.selected[0].ref1, ref2: me.selected[0].ref2, ref3: me.selected[0].ref3, ref4: me.selected[0].ref4, ref5: me.selected[0].ref5,
                    ref6: me.selected[0].ref6, ref7: me.selected[0].ref7, ref8: me.selected[0].ref8, ref9: me.selected[0].ref9, activo:true});
                me.aperturas.push({empresaId:me.headermovimientos[0].empresaId, loteId:me.headermovimientos[0].loteId,asientoId:null, origen:'APE',
                    grpconcepto: me.grpconceptos.find( element => element.esajuape == true)["text"],concepto:'Ajuste en App',fecha:ahora.substr(0,10),importe:(me.totalPagado*1).toFixed(2),
                    ref0: me.selected[0].ref0, ref1: me.selected[0].ref1, ref2: me.selected[0].ref2, ref3: me.selected[0].ref3, ref4: me.selected[0].ref4, ref5: me.selected[0].ref5,
                    ref6: me.selected[0].ref6, ref7: me.selected[0].ref7, ref8: me.selected[0].ref8, ref9: me.selected[0].ref9, activo:true});
            },
            splitApertura(){
                let me=this;
                var date = new Date();
                var ahora=new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString();
                me.aperturas.push({empresaId:me.headermovimientos[0].empresaId, loteId:me.headermovimientos[0].loteId,asientoId:null, origen:'APE',
                    grpconcepto: me.grpconceptos.find( element => element.esajuape == true)["text"],concepto:'Ajuste en App',fecha:ahora.substr(0,10),importe:(me.totalAperturas*(-1)).toFixed(2),
                    ref0: me.selected[0].ref0, ref1: me.selected[0].ref1, ref2: me.selected[0].ref2, ref3: me.selected[0].ref3, ref4: me.selected[0].ref4, ref5: me.selected[0].ref5,
                    ref6: me.selected[0].ref6, ref7: me.selected[0].ref7, ref8: me.selected[0].ref8, ref9: me.selected[0].ref9, activo:true});
            },
            guardarApertura(){
                let me=this;
                var _empresaId=[], _loteId=[], _asientoId=[], _origen=[], _grpconceptoId=[], _concepto=[], _fecha=[], _importe=[], _ref0=[], _ref1=[], _ref2=[], _ref3=[], _ref4=[], _ref5=[], _ref6=[], _ref7=[], _ref8=[], _ref9=[];
                for (var i=0; i<me.aperturas.length; i++ ){
                    _empresaId.push(me.aperturas[i].empresaId);
                    _loteId.push(me.aperturas[i].loteId);
                    _asientoId.push(me.aperturas[i].asientoId);
                    _origen.push(me.aperturas[i].origen);
                    _grpconceptoId.push(me.grpconceptos.find( element => element.esajuape == true)["value"]);
                    _concepto.push(me.aperturas[i].concepto);
                    _fecha.push(me.aperturas[i].fecha);
                    _importe.push(me.aperturas[i].importe).toFixed(2);
                    _ref0.push(me.aperturas[i].ref0);
                    _ref1.push(me.aperturas[i].ref1);
                    _ref2.push(me.aperturas[i].ref2);
                    _ref3.push(me.aperturas[i].ref3);
                    _ref4.push(me.aperturas[i].ref4);
                    _ref5.push(me.aperturas[i].ref5);
                    _ref6.push(me.aperturas[i].ref6);
                    _ref7.push(me.aperturas[i].ref7);
                    _ref8.push(me.aperturas[i].ref8);
                    _ref9.push(me.aperturas[i].ref9);
                }
                var date = new Date();                
                let header={"Authorization" : "Bearer " + me.$store.state.token};
                let configuracion= {headers : header};
                axios.post('api/Movimientos/Crearapertura',{
                    'empresaId': _empresaId,
                    'loteId': _loteId,
                    'asientoId': _asientoId,
                    'origen': _origen,
                    'grpconceptoId': _grpconceptoId,
                    'concepto': _concepto,
                    'fecha': _fecha,
                    'importe': _importe,
                    'ref0': _ref0,
                    'ref1': _ref1,
                    'ref2': _ref2,
                    'ref3': _ref3,
                    'ref4': _ref4,
                    'ref5': _ref5,
                    'ref6': _ref6,
                    'ref7': _ref7,
                    'ref8': _ref8,
                    'ref9': _ref9,
                    'etlId': null,
                    'iduseralta': me.$store.state.usuario.idusuario                           
                },configuracion).then(function(response){
                    me.selected=[];
                    me.adaperturas=false;
                    me.closeForm();
                    me.limpiarDetail();                      
                    me.listarDetail();
                }).catch(function(error){
                    me.snacktext = 'Se detectó un error. Código: '+ error.response.status;
                    me.snackbar = true;
                    console.log(error);
                });
            },
            createDetail(){
                this.limpiarDetail();
                this.editIndex=-1;
            },          
            closeDetail () {
                this.dialog = false;
                this.limpiarMaster();
            },
            closeForm () {
                this.validaMensaje = [];
                this.limpiarDetail();
            },
            limpiarMaster(){
                this.idproyecto = '';                
                this.orden = '';
                this.proyecto = '';
                this.producto = '';
                this.fecadjudicacion = '';
                this.ars1usd = '',               
                this.totalPagado = 0;
                this.totalAjustado = 0;
                this.totalAperturas = 0;
            },
            limpiarDetail(){
                this.id="";
                this.empresaId="";
                this.loteId="";
                this.origen="";
                this.grpconceptoId="";
                this.concepto="";
                this.fecha="";
                this.importe=""
                this.ref0="";
                this.ref1="";
                this.ref2="";
                this.ref3="";
                this.ref4="";
                this.ref5="";
                this.ref6="";
                this.ref7="";
                this.ref8="";
                this.ref9="";
                this.etlid="";
                this.iduseralta = "";
                this.fecalta = "";
                this.iduserumod = "";
                this.fecumod = "";
                this.editedIndex=-1;
            },
        }        
    }
</script>
