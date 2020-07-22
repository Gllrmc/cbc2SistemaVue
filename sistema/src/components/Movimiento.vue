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
                        <v-dialog v-model="dialogForm" max-width="800px" persistent>
                            <v-card>
                                <v-card-title>
                                <span class="headline">{{ formTitle }}</span>
                                </v-card-title>            
                                <v-card-actions>
                                    <v-spacer></v-spacer>
                                    <v-btn color="blue darken-1" flat @click.native="closeForm">Cancelar</v-btn>
                                    <v-btn color="blue darken-1" flat @click.native="guardar">Guardar</v-btn>
                                </v-card-actions>
                                <v-card-text>
                                    <v-container grid-list-md>
                                        <v-row dense>
                                            <v-col cols="12" sm="6" md="6">
                                                <v-select v-model="empresaId" 
                                                :items = "empresas" label = "Empresa">
                                                </v-select>
                                            </v-col>
                                            <v-col cols="12" sm="6" md="6">
                                                <v-autocomplete v-model="bancoId" 
                                                clearable 
                                                :items = "bancos" label = "Banco">
                                                </v-autocomplete>
                                            </v-col>
                                            <v-col cols="12" sm="3" md="3">
                                                <v-select v-model="tipo" :items = "tipos" label="Tipo"></v-select>
                                            </v-col>
                                            <v-col cols="12" sm="3" md="3">
                                                <v-select v-model="moneda" :items = "monedas" label="Moneda"></v-select>
                                            </v-col>
                                            <v-col cols="12" sm="6" md="6">
                                                <v-text-field v-model="numcuenta" label="#Cuenta"></v-text-field>
                                            </v-col>
                                            <v-col cols="12" sm="12" md="12" v-show="valida">
                                                <div class="red--text" v-for="v in validaMensaje" :key="v" v-text="v">
                                                </div>
                                            </v-col> 
                                        </v-row>
                                    </v-container>
                                </v-card-text>
                            </v-card>
                        </v-dialog>
                        <v-dialog v-model="adModal" max-width="290">
                            <v-card>
                                <v-card-title class="headline" v-if="adAccion==1">¿Activar Banco?</v-card-title>
                                <v-card-title class="headline" v-if="adAccion==2">Bloquear Banco?</v-card-title>
                                <v-card-text>
                                    Estás a punto de 
                                    <span v-if="adAccion==1">Activar </span>
                                    <span v-if="adAccion==2">Bloquear </span>
                                    el Banco {{ adNombre }}
                                </v-card-text>
                                <v-card-actions>
                                    <v-spacer/>
                                    <v-btn small @click="activarDesactivarCerrar">Cancel
                                    <v-icon>cancel</v-icon>
                                    </v-btn>
                                    <v-btn small v-if="adAccion==1" @click="activar">Activar
                                    <v-icon>lock_open</v-icon>
                                    </v-btn>
                                    <v-btn small v-if="adAccion==2" @click="desactivar">Bloquear
                                    <v-icon>lock</v-icon>
                                    </v-btn>
                                </v-card-actions>
                            </v-card>
                        </v-dialog>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="primary" dark class="mb-2" @click.native="copartidas=true">Conciliados</v-btn>
                            <v-btn color="primary" dark class="mb-2" @click.native="adpartidas=true">Seleccionados</v-btn>
                            <v-btn color="success" dark class="mb-2" @click.native="closeDetail">Salir</v-btn>
                        </v-card-actions>
                        <v-row fluid>
                            <v-col cols="12" sm="12" md="12">
                                <v-card-title>Sin Conciliar</v-card-title>
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
                                    class="elevation-1"
                                    >
                                    <template v-slot:item.fecha="{ item }">
                                        <p class="text-center">{{ item.fecha.substr(0, 10) }}</p>
                                    </template>
                                    <template v-slot:item.importe="{ item }">
                                        <p class="text-right">{{ formatPrice(item.importe)}}</p>
                                    </template>

                                    <template v-slot:item.unsgimporte="{ item }">
                                        <p class="text-right">{{ formatPrice(item.unsgimporte)}}</p>
                                    </template>
                                    <template v-slot:item.fecalta="{ item }">
                                        <td>{{ item.fecalta.substr(0, 16) }}</td>
                                    </template>
                                    <template v-slot:item.fecumod="{ item }">
                                        <td>{{ item.fecumod.substr(0, 16) }}</td>
                                    </template>
                                    <template v-slot:no-data>
                                        <v-btn color="primary" @click="listarDetail">Resetear</v-btn>
                                    </template>
                                </v-data-table>
                            </v-col>
                        </v-row>
                        <v-dialog v-model="adpartidas" max-width="1100px" persistent>
                            <v-card>
                                <v-toolbar color="blue darken-3" dark>
                                    <v-toolbar-title>Partidas seleccionadas</v-toolbar-title>
                                </v-toolbar>
                                <v-card-actions>
                                    <v-spacer></v-spacer>
                                    <v-btn color="primary" dark class="mb-2" @click.native="conciliarPartidas">Grabar</v-btn>
                                    <v-btn color="success" dark class="mb-2" @click.native="adpartidas=false">Salir</v-btn>
                                </v-card-actions>
                                <v-card-text>                            
                                    <v-col cols="12"  sm="12" md="12">
                                        <v-data-table
                                            :headers="headersDetalleSelec"
                                            :items="selected"
                                            :search="search"
                                            class="elevation-1"
                                            >

                                            <template v-slot:item.fecha="{ item }">
                                                <p class="text-center">{{ item.fecha.substr(0, 10) }}</p>
                                            </template>
                                            <template v-slot:item.importe="{ item }">
                                                <p class="text-right">{{ formatPrice(item.importe)}}</p>
                                            </template>

                                            <template v-slot:item.unsgimporte="{ item }">
                                                <p class="text-right">{{ formatPrice(item.unsgimporte)}}</p>
                                            </template>
                                            <template v-slot:item.fecalta="{ item }">
                                                <td>{{ item.fecalta.substr(0, 16) }}</td>
                                            </template>
                                            <template v-slot:item.fecumod="{ item }">
                                                <td>{{ item.fecumod.substr(0, 16) }}</td>
                                            </template>
                                            <template v-slot:no-data>
                                                <v-btn color="primary" @click="listarDetail">Sin Items</v-btn>
                                            </template>
                                        </v-data-table>
                                    </v-col>
                                    <v-col cols=12 align="end">
                                        <strong>Total Movimientos: </strong>$ {{totalPagado=(calcularTotal).toFixed(2)}}
                                    </v-col>
                                </v-card-text>
                            </v-card>
                        </v-dialog>
                        <v-dialog v-model="copartidas" max-width="1100px" persistent>
                            <v-card>
                                <v-toolbar color="blue darken-3" dark>
                                    <v-toolbar-title>Partidas Conciliadas</v-toolbar-title>
                                </v-toolbar>
                                <v-card-actions>
                                    <v-spacer></v-spacer>
                                    <v-btn color="primary" dark class="mb-2" @click.native="conciliarPartidas">Reversar</v-btn>
                                    <v-btn color="success" dark class="mb-2" @click.native="copartidas=false">Salir</v-btn>
                                </v-card-actions>
                                <v-row fluid>
                                    <v-col cols="12" sm="12" md="12">
                                        <v-data-table
                                            v-model="selected"
                                            :headers="headersDetalleConc"
                                            group-by="asientoId"
                                            :items="conmovs"
                                            :search="search"
                                            multi-sort
                                            sort-desc
                                            :sort-by="ordenacion"
                                            class="elevation-1"
                                            >
                                            <template v-slot:item.fecha="{ item }">
                                                <p class="text-center">{{ item.fecha.substr(0, 10) }}</p>
                                            </template>
                                            <template v-slot:item.importe="{ item }">
                                                <p class="text-right">{{ formatPrice(item.importe)}}</p>
                                            </template>

                                            <template v-slot:item.unsgimporte="{ item }">
                                                <p class="text-right">{{ formatPrice(item.unsgimporte)}}</p>
                                            </template>
                                            <template v-slot:item.fecalta="{ item }">
                                                <td>{{ item.fecalta.substr(0, 16) }}</td>
                                            </template>
                                            <template v-slot:item.fecumod="{ item }">
                                                <td>{{ item.fecumod.substr(0, 16) }}</td>
                                            </template>
                                            <template v-slot:no-data>
                                                <v-btn color="primary" @click="listarDetail">Resetear</v-btn>
                                            </template>
                                        </v-data-table>
                                    </v-col>
                                </v-row>
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
                <template v-slot:item.actions="{ item }">
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
                snacktext: 'Hola',
                timeout: 4000,
                headermovimientos: [],
                totalPagado: 0,
                selected: [],
                conmovs: [],
                nocmovs: [],
                empresas: [],
                bancos: [],
                ordenacion: ["unsgimporte","fecha"],
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
                dialogForm: false,
                headersMaster: [
                    { text: '[Opciones]', value: 'actions', align: 'center', sortable: false },
                    { text: 'Empresa', value: 'empresa', align: 'start', sortable: true },
                    { text: 'Cuentas Asociadas', value: 'asocuenta', align: 'start', sortable: true },
                    { text: 'Lote#', value: 'loteId', align: 'center', sortable: true },
                    { text: 'Año/Mes', value: 'aniomes', align: 'center', sortable: true },
                    { text: 'Cantidad', value: 'cantidad', align: 'center', sortable: true },
                ],
                headersDetallePend: [
                    // { text: '[Opciones]', value: 'actions', align: 'center', sortable: false },
                    { text: 'Origen', value: 'origen', align: 'start', sortable: true },
                    { text: 'Grupo Conceptos', value: 'grpconcepto', align: 'start', sortable: true },
                    { text: 'Concepto', value: 'concepto', align: 'start', sortable: true },
                    { text: 'Fecha', value: 'fecha', align: 'center', sortable: true },
                    { text: 'Abs(Importe)', value: 'unsgimporte', align: 'center', sortable: true },
                    { text: 'Importe', value: 'importe', align: 'center', sortable: true },
                ],
                headersDetalleConc: [
                    // { text: '[Opciones]', value: 'actions', align: 'center', sortable: false },
                    { text: 'Asiento', value: 'asientoId', align: 'start', sortable: true },
                    { text: 'Origen', value: 'origen', align: 'start', sortable: true },
                    { text: 'Grupo Conceptos', value: 'grpconcepto', align: 'start', sortable: true },
                    { text: 'Concepto', value: 'concepto', align: 'start', sortable: true },
                    { text: 'Fecha', value: 'fecha', align: 'center', sortable: true },
                    { text: 'Importe', value: 'importe', align: 'center', sortable: true },
                ],
                headersDetalleSelec: [
                    // { text: '[Opciones]', value: 'actions', align: 'center', sortable: false },
                    { text: 'Origen', value: 'origen', align: 'start', sortable: true },
                    { text: 'Grupo Conceptos', value: 'grpconcepto', align: 'start', sortable: true },
                    { text: 'Concepto', value: 'concepto', align: 'start', sortable: true },
                    { text: 'Fecha', value: 'fecha', align: 'center', sortable: true },
                    { text: 'Importe', value: 'importe', align: 'center', sortable: true },
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
                copartidas: false
            }
        },
        computed: {
            formTitle () {
                return this.editedIndex === -1 ? 'Nuevo Movimiento' : 'Actualizar Movimiento'
            },
            calcularTotal:function(){
                    var subtotal=0.0;
                    for(var i=0;i<this.selected.length;i++){
                        subtotal+=(this.selected[i].activo?this.selected[i].importe:0);
                    }
                    return subtotal;
                }
            },
        watch: {
            dialogForm (val) {
            val || this.closeForm()
                },
            },
            created () {
                this.listarMaster();
                this.select();
            },
        methods:{
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
            },
            editMasterItem (item) {
                this.empresa = item.empresa;
                this.asocuenta = item.asocuenta;
                this.loteId = item.loteId;
                this.aniomes = item.aniomes;
                this.selected = [];
                this.listarDetail();
                this.dialog = true
            },
            editDetailItem (item) {
                this.id=item.id;
                this.empresaId=item.empresaId;
                this.bancoId=item.bancoId;
                this.tipo=item.tipo;
                this.moneda=item.moneda;
                this.numcuenta=item.numcuenta;
                this.iduseralta=item.iduseralta;
                this.fecalta=item.fecalta;
                this.iduserumod=item.iduserumod;
                this.fecumod=item.fecumod;
                this.activo=item.activo;                
                this.editedIndex=1;
                this.dialogForm = true
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
            conciliarPartidas(){
                if (this.totalPagado==0){
                    this.guardarSelected();
                }else{
                    this.generarConciliacion();
                }
            },
            generarConciliacion(){
                var date = new Date();
                this.grpconcepto='';
                this.concepto='';
                this.fecha=new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString();
                this.importe=this.totalPagado;
                this.fecalta='';
                this.iduserumod='';
                this.fecumod='';
                this.activo=true;                
                this.editedIndex=-1;
                this.dialogForm=true;
            },
            guardarSelected(){
                let me=this;             
                var date = new Date();
                console.log(this.selected[0].id, this.selected[1].id);
                var idupdates = [];
                idupdates = this.selected.map( function (eachobj) {return eachobj.id});
                let header={"Authorization" : "Bearer " + me.$store.state.token};
                let configuracion= {headers : header};
                axios.put('api/Movimientos/Actualizarasiento',{
                    'Id':idupdates,
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
            createDetail(){
                this.limpiarDetail();
                this.editIndex=-1;
                this.dialogForm = true;
            },          
            closeDetail () {
                this.dialog = false;
                this.limpiarMaster();
            },
            closeForm () {
                this.dialogForm = false;
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
            },
            limpiarDetail(){
                this.id="";
                this.empresaId="";
                this.bancoId="";
                this.tipo="";
                this.moneda="";
                this.numcuenta="";
                this.iduseralta = "";
                this.fecalta = "";
                this.iduserumod = "";
                this.fecumod = "";
                this.editedIndex=-1;
            },
        guardar () {
            let me=this;
            if (me.validar()){
                return;
            }
            var date = new Date();                
            let header={"Authorization" : "Bearer " + me.$store.state.token};
            let configuracion= {headers : header};
            if (me.editedIndex > -1) {
                //Código para editar
                //Código para guardar
                axios.put('api/Movimientos/Actualizar',{
                    'Id':me.id,
                    'empresaId': me.empresaId,
                    'bancoId': me.bancoId,
                    'tipo': me.tipo,
                    'moneda': me.moneda,
                    'numcuenta': me.numcuenta,
                    'iduseralta': me.iduseralta,
                    'fecalta': me.fecalta,
                    'iduserumod': me.$store.state.usuario.idusuario,
                    'fecumod': new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString()                        
                },configuracion).then(function(response){
                    me.closeForm();
                    me.limpiarDetail();                      
                    me.listarDetail();
                }).catch(function(error){
                    me.snacktext = 'Se detectó un error. Código: '+ error.response.status;
                    me.snackbar = true;
                    console.log(error);
                });
            } else {
                //Código para guardar
                axios.post('api/Movimientos/Crear',{
                    'empresaId': me.empresaId,
                    'bancoId': me.bancoId,
                    'tipo': me.tipo,
                    'moneda': me.moneda,
                    'numcuenta': me.numcuenta,
                    'iduseralta': me.$store.state.usuario.idusuario                           
                },configuracion).then(function(response){
                    me.closeForm();
                    me.limpiarDetail();                        
                    me.listarDetail();
                }).catch(function(error){
                    me.snacktext = 'Se detectó un error. Código: '+ error.response.status;
                    me.snackbar = true;
                    console.log(error);
                });
            }
        },
        validar(){
            this.valida=0;
            this.validaMensaje=[];

            if (this.numcuenta.length<3 || this.numcuenta.length>20){
                this.validaMensaje.push("El numero de cuenta debe tener más de 3 caracteres y menos de 20 caracteres.");
            }
            if (!this.empresaId){
                this.validaMensaje.push("Ingrese una Empresa.");
            }
            if (!this.bancoId){
                this.validaMensaje.push("Ingrese un Banco.");
            }
            if (!this.tipo){
                this.validaMensaje.push("Ingrese el tipo de cuenta.");
            }
            if (!this.moneda){
                this.validaMensaje.push("Ingrese la moneda de la cuenta.");
            }
            if (this.validaMensaje.length){
                this.valida=1;
            }
            return this.valida;
        },

        activarDesactivarMostrar(accion,item){
            this.adModal=1;
            this.adNombre=item.nombre;
            this.adId=item.id;                
            if (accion==1){
                this.adAccion=1;
            }
            else if (accion==2){
                this.adAccion=2;
            }
            else{
                this.adModal=0;
            }
        },
        activarDesactivarCerrar(){
            this.adModal=0;
        },
        activar(){
            let me=this;
            let header={"Authorization" : "Bearer " + this.$store.state.token};
            let configuracion= {headers : header};
            axios.put('api/Movimientos/Activar/'+this.adId,{},configuracion).then(function(response){
                me.adModal=0;
                me.adAccion=0;
                me.adNombre="";
                me.adId="";
                me.listarDetail();                       
            }).catch(function(error){
                me.snacktext = 'Se detectó un error. Código: '+ error.response.status;
                me.snackbar = true;
                console.log(error);
            });
        },
        desactivar(){
            let me=this;
            let header={"Authorization" : "Bearer " + this.$store.state.token};
            let configuracion= {headers : header};
            axios.put('api/Movimientos/Desactivar/'+this.adId,{},configuracion).then(function(response){
                me.adModal=0;
                me.adAccion=0;
                me.adNombre="";
                me.adId="";
                me.listarDetail();                       
            }).catch(function(error){
                me.snacktext = 'Se detectó un error. Código: '+ error.response.status;
                me.snackbar = true;
                console.log(error);
            });
        }
        }        
    }
</script>
